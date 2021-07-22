/**
 * MODULES
 */
const config                  = require("../config/config.json");
const NOUN_PROJECT_API_KEY    = config.NOUN_PROJECT_API_KEY;
const NOUN_PROJECT_API_SECRET = config.NOUN_PROJECT_API_SECRET;

const fs                      = require("fs");
const path                    = require("path");
const NounProject             = require("the-noun-project");

const Download                = require("../src/logo/download");
const Logo                    = require("../src/logo/logo");
const Inspirations            = require("../src/logo/inspiration");
const Information             = require("../src/logo/information");
const recipes                 = require("../src/logo/recipes");
const fonts                   = require("../src/logo/fonts");
const Colors                  = require("../src/logo/color");
const async                   = require("async");
const WordPOS                 = require("wordpos");
const rq                      = require('request');

const zip                     = new require("node-zip")();
wordpos                       = new WordPOS();
var shell                     = require('shelljs');

const { Storage }             = require("@google-cloud/storage");

const storage = new Storage({
  projectId: "dbro2020",
  keyFilename: path.join(__dirname + "/../dbro2020-649521c8a52d.json"),
});
const bucket                  = storage.bucket("artifacts.dbro2020.appspot.com");

/**
 * EXPORT FUNCTIONS
 */
exports.getLogoService = getLogoService;
exports.getConceptService = getConceptService;
exports.getConceptService = getConceptService;
exports.logoDownloadService = logoDownloadService;

const nounProject = new NounProject({
  key: NOUN_PROJECT_API_KEY,
  secret: NOUN_PROJECT_API_SECRET,
});

/**
 * FUNCTION DEFINITIONs
 */

 var offsetNum = 0;

async function getLogoService(req) {
  const {
    companyDescription,
    inspirations,
    companyName,
    tagline,
    palettes,
  } = req.body;
  const session_id = req.headers["set-cookie"][0].split("=")[1];

  const inspiration = new Inspirations(inspirations);
  const rules = inspiration.getInspirations();
  const information = new Information(companyName, tagline).getInformation();
  const colors = new Colors(palettes);
  const colorPalettes = colors.applyRules();
  const characteristics = [];
  const logos = [];

  return new Promise((resolve, reject) => {
    async.waterfall(
      [saveData, getSearchString, getLogos, createLogos],
      (error, result) => {
        if (error) return reject(error);
        else return resolve(result);
      }
    );
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return { statusCode: 500 };
    });

  function saveData(cb) {
    let sql = `INSERT INTO logo (session_id, company_name, company_description, tag_line, palettes, inspirations)
    VALUES (?, ?, ?, ?, ?, ?)`;
    let query = con.query(
      sql,
      [
        session_id,
        companyName,
        companyDescription,
        tagline,
        JSON.stringify(palettes),
        JSON.stringify(inspirations),
      ],
      (err, result) => {
        // console.log(query.sql)
        cb(null, "");
      }
    );
  }

  function getSearchString(result, cb) {
    let searchString = `${companyName} ${companyDescription} ${tagline}`;
    console.log("searchString => " + searchString);
    wordpos.getNouns(searchString, (result) => {
      console.log(result);
      cb(null, result);
    });
  }

  function getLogos(terms = [], cb) {
    //const limit = palettes.length; // / terms.length;
    let logos = [];
    var limit;
    console.log(limit);
    if(!terms.length){
      terms.push = companyName;
      limit = 12;
    } else{
      limit = 12/terms.length;
    }
    if (!terms.length) {
      cb(null, []);
    } else {
      terms.forEach((x, index) => {
        
        console.log("x ==> " + x);
        console.log("terms --> " + terms + "index - " + index);
        nounProject.getIconsByTerm(x, { limit: limit}, function (err, data) {
          if (err) {
            if (index === terms.length - 1) {
              return cb(null, []);
            }
          } else {
            data.icons.filter((x) => {
              logos.push(x);
            });
          }

          if (index === terms.length - 1) {
            let count = 0;
            logos.map((x) => {
              const previewUrl = x.preview_url;
              console.log("previewUrl => " + previewUrl);
            
              const url = previewUrl.split("/");
              const name = url[url.length - 1]
              let bucketFile = bucket.file(`noun-project/${session_id}/${name}`);
              const fileWriteStream = bucketFile.createWriteStream();
              let rqPipe = rq(previewUrl).pipe(fileWriteStream);
              rqPipe.on('finish', async () => {
                await bucketFile.makePublic();
                await bucketFile.getSignedUrl({
                  action: "read",
                  expires: "03-09-2491",
                })
                .then((signedUrls) => {
                  x.preview_url = signedUrls[0];
                  if (count === logos.length - 1) {
                    cb(null, logos)
                  }
                  count += 1;
                  return x;
                });
              });
            })

            // cb(null, logos);
          }
        });
      });
    }
  }

  function createLogos(logo, cb) {
    let count = 0; // TODO refactor this.
    colorPalettes.forEach((palette, index) => {
      if (rules[count] === undefined) {
        // TODO refactor this.
        count = 0;
      }
      characteristics.push([
        information.name,
        information.tagline,
        rules[count],
        palette[0],
        palette[1],
        logo[index] || [],
      ]);
      count += 1;
    });

    for (let i = 0; i < characteristics.length; i++) {
      logos.push(
        new Logo(
          characteristics[i][0],
          characteristics[i][1],
          characteristics[i][2],
          characteristics[i][3],
          characteristics[i][4],
          characteristics[i][5],
        ).generate()
      );
    }

    const returnedLogos = [];

    for (let i = 0; i < logos.length; i++) {
      returnedLogos.push(logos[i]);
    }

    return cb(null, {
      statusCode: 200,
      concepts: logos,
    });
  }
}

async function getConceptService(req) {
  const {
    companyDescription,
    inspirations,
    companyName,
    tagline,
    palettes,
  } = req.body;
  const session_id = req.headers["set-cookie"][0].split("=")[1];
  const inspiration = new Inspirations(inspirations);
  const rules = inspiration.generateMoreConcepts();
  const information = new Information(companyName, tagline).getInformation();
  const colors = new Colors(palettes);
  const colorPalettes = colors.applyRules();
  const characteristics = [];
  const logos = [];

  return new Promise((resolve, reject) => {
    async.waterfall(
      [saveData, getSearchString, getLogos, createLogos],
      (error, result) => {
        if (error) return reject(error);
        else return resolve(result);
      }
    );
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return { statusCode: 500 };
    });

  function saveData(cb) {
    let sql = `INSERT INTO logo (session_id, company_name, company_description, tag_line, palettes, inspirations)
    VALUES (?, ?, ?, ?, ?, ?)`;
    let query = con.query(
      sql,
      [
        session_id,
        companyName,
        companyDescription,
        tagline,
        JSON.stringify(palettes),
        JSON.stringify(inspirations),
      ],
      (err, result) => {
        // console.log(query.sql)
        cb(null, "");
      }
    );
  }

  function getSearchString(result, cb) {
    let searchString = `${companyName || ""} ${companyDescription || ""} ${
      tagline || ""
    }`;

    wordpos.getNouns(searchString, (result) => {
      cb(null, result);
    });
  }

  function getLogos(terms = [], cb) {
    //const limit = colorPalettes.length; // / terms.length;

    // var termNum = 12/terms.length;
    // var limit = termNum;
    // offsetNum = offsetNum + termNum;

    var limit;
    if(!terms.length){
      terms.push = companyName;
      limit = 12;
      offsetNum = offsetNum + 12;
    } else{
      termNum = 12/terms.length;
      limit = termNum;
      offsetNum = offsetNum + termNum;
    }

    //limit = 12;
    let logos = [];
    if (!terms.length) {
      cb(null, []);
    } else {
      terms.forEach((x, index) => {
        
        nounProject.getIconsByTerm(x, {limit, offset: offsetNum }, function (err, data) {
          if (err) {
            if (index === terms.length - 1) {
              return cb(null, []);
            }
          } else {
            data.icons.filter((x) => {
              logos.push(x);
            });
          }

          if (index === terms.length - 1) {
            let count = 0;
            logos.map((x) => {
              const previewUrl = x.preview_url;
            
              const url = previewUrl.split("/");
              const name = url[url.length - 1]
              let bucketFile = bucket.file(`noun-project/${session_id}/${name}`);
              const fileWriteStream = bucketFile.createWriteStream();
              let rqPipe = rq(previewUrl).pipe(fileWriteStream);
              rqPipe.on('finish', async () => {
                await bucketFile.makePublic();
                await bucketFile.getSignedUrl({
                  action: "read",
                  expires: "03-09-2491",
                })
                .then((signedUrls) => {
                  x.preview_url = signedUrls[0];
                  if (count === logos.length - 1) {
                    cb(null, logos)
                  }
                  count += 1;
                  return x;
                });
              });
            })

            // cb(null, logos);
          }
        });
      });
    }
  }

  function createLogos(logo, cb) {
    let count = 0; // TODO refactor this.
    colorPalettes.forEach((palette, index) => {
      if (rules[count] === undefined) {
        // TODO refactor this.
        count = 0;
      }
      characteristics.push([
        information.name,
        information.tagline,
        rules[count],
        palette[0],
        palette[1],
        logo[index] || [],
      ]);
      count += 1;
    });

    for (let i = 0; i < characteristics.length; i++) {
      logos.push(
        new Logo(
          characteristics[i][0],
          characteristics[i][1],
          characteristics[i][2],
          characteristics[i][3],
          characteristics[i][4],
          characteristics[i][5],
          characteristics[i][6],
          null
        ).generate()
      );
    }

    const returnedLogos = [];

    for (let i = 0; i < logos.length; i++) {
      returnedLogos.push(logos[i]);
    }

    return cb(null, {
      statusCode: 200,
      concepts: logos,
    });
  }
}

async function logoDownloadService(req) {
  const session_id = req.headers["set-cookie"][0].split("=")[1];
  const download = new Download(req.body.logo, session_id);
  
  //var svg = fs.readFileSync(await download.convertLogoToPath(), 'utf8');
  //await download.downloadImage(svg);
  // console.log("dir---" + __dirname);
  // while (!fs.existsSync(__dirname + "/../image.png")) {
  //   await sleeps(1000)
  //   function sleeps(ms) {
  //     return new Promise((resolve) => {
  //       setTimeout(resolve, ms);
  //     });
  //   }
  // }

  const highResPNG = await download.generateHighRes("png");

  // const highResPNGWithBG = await download.generateHighRes("png", true);
  // const highResPDF       = await download.generateHighRes("pdf");
  // const highResEPS       = await download.generateHighRes("eps");
  // const SVG              = await download.generateSVG();

  return highResPNG;
}

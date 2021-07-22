const fs          = require("fs");
const path        = require("path");
const exec        = require("child_process").exec;

const PDFDocument = require("pdfkit");
const SVGtoPDF    = require("svg-to-pdfkit");
const getStream = require('get-stream')
const convertPngFile = require('convert-svg-to-png');
const convertJpgFile = require('convert-svg-to-jpeg');
const request = require('request');
const AdmZip = require('adm-zip');

const Jimp = require('jimp');

const INKSCAPE    = "/Applications/Inkscape.app/Contents/Resources/script";
const svg2img     = require("svg2img");

// GOOGLE CLOUD STORAGE
const { Storage } = require("@google-cloud/storage");
const storage     = new Storage({
  projectId       : "dbro2020",
  keyFilename     : path.join(__dirname + "/../../dbro2020-649521c8a52d.json"),
});
const bucket      = storage.bucket("artifacts.dbro2020.appspot.com");
const folder      = "logos";

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}

const { svg2png } = require('svg-png-converter')
const LOGO_WIDTH  = 300;
const LOGO_HEIGHT = 230;

class Download {
  constructor(logo, session) {
    this.logo = logo;
    this.session = session;
  }

  async createLogoFile() {
    const filepath = path.join(`${__dirname}/../../logo.svg`);
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, this.logo, [], (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(filepath);
      });
    });
  }

  async createLogoFileStream(bool) {
    const data = bool ? this.logo.replace("transparent", "#fff") : this.logo;

    //var buffers = await getStream.buffer(await this.getFileDataBuffer(SVG));

    const logo = await this.generateFile(`logo.svg`, data);
    return logo;
  }

  async minifyLogo() {
    let logoFile;
    try {
      logoFile = await this.createLogoFileStream();
    } catch (error) {
      return error;
    }

    var content = await this.getFileDataButf8(logoFile);
    
    content = content.replace('width="300" height="225" id="logo"', 'id="logo"');
    content = content.replace('height="0"', '');

    
    return new Promise((resolve, reject) => {
      //await this.generateFile(`logo.min.svg`, data);
      const logo = this.generateFile(`logo.min.svg`, content);

      return resolve(logo);
    });
  }

  async convertLogoToPath() {
    let logoFile;
    try {
      logoFile = await this.minifyLogo();
    } catch (error) {
      return error;
    }

    var content = await this.getFileDataButf8(logoFile);
    //var styleContent = fs.readFileSync(`${__dirname}/../../style.txt`, 'utf8');

    const styleTxtFile = "style.txt";
    const styleTxt = bucket.file(styleTxtFile);
    const styleTxtBlob = await styleTxt.createReadStream();

    var styleString = await getStream.buffer(styleTxtBlob);
    styleString = Buffer.from(styleString).toString("utf-8");

    var styleFamily = content.split('font-family="')[1].split('"')[0];
    var subStyleFamily = content.split('font-family="')[2].split('"')[0];

    var urlsStr = styleString.split("font-family: '" + styleFamily + "';")[1];
    var urlsStr1 = styleString.split("font-family: '" + subStyleFamily + "';")[1];

    var urlsArr = urlsStr.split('url("');
    var urlsArr1 = urlsStr1.split('url("');

    //console.log("urlsArr == >" + urlsArr);

    const fileName1 = urlsArr[1].split('"')[0];
    const blob1 = bucket.file(fileName1);
    const blobStream1 = await blob1.createReadStream();

    const fileName2 = urlsArr[2].split('"')[0];
    const blob2 = bucket.file(fileName2);
    const blobStream2 = await blob2.createReadStream();

    const fileName3 = urlsArr[3].split('"')[0];
    const blob3 = bucket.file(fileName3);
    const blobStream3 = await blob3.createReadStream();

    var font1 = await getStream.buffer(blobStream1);
    var font2 = await getStream.buffer(blobStream2);
    var font3 = await getStream.buffer(blobStream3);

    ///
    const fileName4 = urlsArr1[1].split('"')[0];
    const blob4 = bucket.file(fileName4);
    const blobStream4 = await blob4.createReadStream();

    const fileName5 = urlsArr1[2].split('"')[0];
    const blob5 = bucket.file(fileName5);
    const blobStream5 = await blob5.createReadStream();

    const fileName6 = urlsArr1[3].split('"')[0];
    const blob6 = bucket.file(fileName6);
    const blobStream6 = await blob6.createReadStream();

    var font4 = await getStream.buffer(blobStream4);
    var font5 = await getStream.buffer(blobStream5);
    var font6 = await getStream.buffer(blobStream6);

    // var font1 = await fs.readFileSync(`${__dirname}/../../svg-fonts/alex-brush/alexbrush-regular-webfont.woff`);
    // var font2 = await fs.readFileSync(`${__dirname}/../../svg-fonts/alex-brush/alexbrush-regular-webfont.woff2`)
    let base64data1 = font1.toString('base64');
    let base64data2 = font2.toString('base64');
    let base64data3 = font3.toString('base64');
    let base64data4 = font4.toString('base64');
    let base64data5 = font5.toString('base64');
    let base64data6 = font6.toString('base64');
    content = content.split('</defs>')[0] + "<style>"+
    "@font-face {      font-family: '"+ styleFamily +"';      src: url('data:application/font-woff;charset=utf-8;base64,"+ base64data1 +"');      src: url('data:application/font-woff;charset=utf-8;base64,"+ base64data2 +"'), url('data:application/font-woff;charset=utf-8;base64,"+ base64data3 +"') format('woff');      font-weight: normal;      font-style: normal; }"+
    "@font-face {      font-family: '"+ subStyleFamily +"';      src: url('data:application/font-woff;charset=utf-8;base64,"+ base64data4 +"');      src: url('data:application/font-woff;charset=utf-8;base64,"+ base64data5 +"'), url('data:application/font-woff;charset=utf-8;base64,"+ base64data6 +"') format('woff');      font-weight: normal;      font-style: normal; }</style>" + '</defs>' +  content.split('</defs>')[1];
    //content = '<?xml version="1.0" encoding="utf-8"?><?xml-stylesheet type="text/css" href="./svg-style/bundle.css" ?>\n' + content; 
    //fs.writeFile(__dirname+"/../../createdPdf.svg", content, []);
    
    return new Promise((resolve, reject) => {
      return resolve(content);
    });
  }

  async downloadImage(svg){
    if(svg.includes("https://storage.googleapis.com/") == true){
      var string = svg.split("https://storage.googleapis.com/"); 
        string = string[1].split("\"")[0];
        const url = 'https://storage.googleapis.com/'+string;
        const path = `${__dirname}/../../image.png`;

        console.log("in");

        download(url, path, () => {
          console.log('✅ Done!')
        });
        console.log("out");
      }
  }

  async generateHighRes(extension, background) {
    let SVG;
    let data;

    let highResPNG, highResJPG, highResPDF, SVGPath;
    let pngBuffer;
    
    try {
      SVG = await this.createLogoFileStream(background);
      data = await this.getFileDataB64(SVG);

    } catch (error) {
      return error;
    }

    const width = LOGO_WIDTH * 4;
    const height = LOGO_HEIGHT * 4;
    //const png = await svg2png({ input: this.logo, format: 'png', width, height, encoding: 'dataURL' })
    //const jpg = await svg2png({ input: this.logo, format: 'jpeg', width, height, encoding: 'dataURL' })
    const zip = new AdmZip();
    if(extension == "png")
    {
      var svgContent = await this.convertLogoToPath();
      const logo = await this.generateFile(`created.svg`, svgContent);
      var inputFilePath = logo;
      var svgContent = await this.getFileDataButf8(inputFilePath);
      
      zip.addFile("created.svg", Buffer.alloc(svgContent.length, svgContent), "svg");

      var outputFileBuffer;
      if(background){
        outputFileBuffer = await convertPngFile.convert(await this.getFileDataButf8(inputFilePath), {
          width: width,
          height: height,
          background: "#fff"
        });
      }
      else{
        outputFileBuffer = await convertPngFile.convert(await this.getFileDataButf8(inputFilePath), {
          width: width,
          height: height,
          baseUrl: inputFilePath
        });
      }

      console.log("pdf generate");

      pngBuffer = outputFileBuffer;

      zip.addFile("created.png", Buffer.alloc(outputFileBuffer.length, outputFileBuffer), "png");

      highResPNG = await this.generateFile("created.png", outputFileBuffer)
      console.log("hello ----!---" + highResPNG);
      //returnPath = outputFilePath;
      if(background)
      outputFileBuffer = await convertJpgFile.convert(await this.getFileDataButf8(inputFilePath), {
          width: width,
          height: height,
          background: "#fff"
        });
      else
      outputFileBuffer = await convertJpgFile.convert(await this.getFileDataButf8(inputFilePath), {
          width: width,
          height: height
        });
      
      zip.addFile("created.jpeg", Buffer.alloc(outputFileBuffer.length, outputFileBuffer), "jpeg");

      highResJPG = await this.generateFile("created.jpeg", outputFileBuffer)
      console.log("hello ----!---" + highResJPG);

      console.log("pdf");

      var svg = await this.getFileDataButf8(inputFilePath);
      //var styleText = fs.readFileSync(__dirname + "/../../style.txt", 'utf8');
      //await this.downloadImage(svg);
      
      // var svgText = svg;
      // if(svg.includes("https://storage.googleapis.com/") == true){
      //   var imageName = svgText.split("https://storage.googleapis.com/")[1].split('"')[0];
      //   var fileName = "image.png";
      //   //imageName = fileName;

      //   svg = svg.replace("https://storage.googleapis.com/" + imageName, `${__dirname}/../../image.png`);
      // }
      console.log("----------font----------");
      
      
      var doc = new PDFDocument();
      

      var pdfPath;

      const blob = bucket.file("created.pdf");
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream
        .on("finish", async () => {
          // const signedUrl = `https://storage.cloud.google.com/artifacts.dbro2020.appspot.com/${fileName}?authuser=0`
          blob
            .getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            })
            .then((signedUrls) => {
              pdfPath = signedUrls[0];
            });
        })
      
      var stream = blobStream;

      //SVGtoPDF(doc, svg, 0, 0, { preserveAspectRatio: "true" });
      doc.image(pngBuffer, 0,200, {width: 650, height: 500})

      doc.pipe(stream);

      doc.end();

      var buffers = await getStream.buffer(doc)

      zip.addFile("created.pdf", Buffer.alloc(buffers.length, buffers), "pdf");

      console.log("finished!");

      highResPDF = `${__dirname}/../../created.pdf`;
    }

    await sleeps(100)
      function sleeps(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

    SVGPath = inputFilePath;

    
    var willSendthis = zip.toBuffer();
    
    //console.log("--------appleData----------" + data);
    var zipPath = await this.generateFile("logos.zip", willSendthis);
    var zipData = await this.getFileDataB64(zipPath);

    //console.log("--------apple----------" + zipData);

    console.log("zip path -- " + zipPath);
    this.clear()

    return [
      { label: "logos.zip", data: zipData },
      // { label: `high-res.png`, data: png.split(",")[1] },
      // { label: `high-res.jpeg`, data: jpg.split(",")[1] },
    ];
  }

  async generateSVG() {
    let logoFile;
    try {
      logoFile = await this.minifyLogo();
    } catch (error) {
      return error;
    }

    return new Promise((resolve, reject) => {
      svg2img(logoFile, { format: "svg" }, function (error, buffer) {
        fs.writeFileSync(`${__dirname}/../../logo.svg`, buffer);
        return resolve(`logo.svg`);
      });
    });
  }

  async generateFile(name, buffer) {
    const fileName = `${folder}/${this.session}/${name}`;
    return new Promise((resolve, reject) => {
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });
      blobStream
        .on("finish", async () => {
          // const signedUrl = `https://storage.cloud.google.com/artifacts.dbro2020.appspot.com/${fileName}?authuser=0`
          blob
            .getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            })
            .then((signedUrls) => {
              resolve(signedUrls[0]);
            });
        })
        .on("error", () => {
          reject(``);
        })
        .end(buffer);
    });
  }

  async generateFileForblobStream(name, buffer) {
    const fileName = `${folder}/${this.session}/${name}`;
    return new Promise((resolve, reject) => {
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });
      blobStream
        .on("finish", async () => {
          // const signedUrl = `https://storage.cloud.google.com/artifacts.dbro2020.appspot.com/${fileName}?authuser=0`
          blob
            .getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            })
            .then((signedUrls) => {
              resolve(blobStream);
            });
        })
        .on("error", () => {
          reject(``);
        })
        .end(buffer);
    });
  }

  async getFileDataB64(url) {
    const axios = require("axios");
    let image = await axios.get(url, { responseType: "arraybuffer" });
    let returnedB64 = Buffer.from(image.data).toString("base64");
    return returnedB64;
  }

  async getFileDataButf8(url) {
    const axios = require("axios");
    let file = await axios.get(url, { responseType: "arraybuffer" });
    let returnedButf8 = Buffer.from(file.data).toString("utf-8");
    return returnedButf8;
  }

  async getFileDataBuffer(url) {
    const axios = require("axios");
    let file = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(file.data);
  }

  clear() {
    fs.unlink(`${__dirname}/../../logo.svg`, () => {});
    fs.unlink(`${__dirname}/../../logo.min.svg`, () => {});
    fs.unlink(`${__dirname}/../../created.svg`, () => {});
    fs.unlink(`${__dirname}/../../created.png`, () => {});
    fs.unlink(`${__dirname}/../../created.jpeg`, () => {});
    fs.unlink(`${__dirname}/../../created.pdf`, () => {});
    fs.unlink(`${__dirname}/../../image.png`, () => {});
    // fs.unlink(`${__dirname}/../../high-res.png`, () => {});
    // fs.unlink(`${__dirname}/../../high-res-with-bg.png`, () => {});
    // fs.unlink(`${__dirname}/../../high-res.pdf`, () => {});
    // fs.unlink(`${__dirname}/../../high-res.eps`, () => {});
  }
}

module.exports = Download;

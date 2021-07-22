const window   = require('svgdom');
const SVG      = require('svg.js')(window);
const document = window.document;
const path     = require('path');

class Logo {
  constructor(companyName, tagline, rules, companyNameColor, taglineColor, icons) {
    this.companyName        = companyName || 'Dopest';
    this.tagline            = tagline || '';
    this.companyNameColor   = companyNameColor;
    this.taglineColor       = taglineColor;
    this.icons              = icons;
    this.rules              = rules;
    this.companyNameElement = null;
    this.taglineElement     = null;
    this.groupElement       = null;
    this.companyNameY       = null;
  }

  generate() {
    const draw = new SVG(document.documentElement).size(300, 225).attr('id', 'logo').attr("style", "background-color: transparent");
    draw.viewbox(0, 0, 297, 210);

    /**
     * Preload fonts.
     */
    this.preloadFonts();

    this.groupElement = draw.group();

    this.drawCompanyLogo(draw, this.groupElement);
    this.drawCompanyName(draw, this.groupElement);

    if (!this.rules.tagline) {
      const svg = draw.svg();
      draw.clear();
      return svg;
    }

    /**
     * Check if recipe has tagline.
     */
    if (this.rules.tagline) {
      this.drawTagline(draw, this.groupElement);
    }

    /**
     * Check if recipe has accent.
     */
    if (this.rules.accent) {
      this.drawAccent(draw);
    }

    if (this.rules.tagline) {
      /**
       * Center group element
       */
      const groupY = 115 - (this.groupElement.bbox().h / 3);

      this.groupElement.attr({
        transform: `translate(0, ${groupY})`,
      });
    }

    const svg = draw.svg();

    draw.clear();

    return svg;
  }

  async drawCompanyLogo(draw) {
    /**
     * Check company name casing
     */
    const previewUrl = (this.icons && this.icons.preview_url) ? this.icons.preview_url : '';
    if (previewUrl) {
      this.companyLogoElement = draw.image(previewUrl).size(100, 100)
  
      this.groupElement.add(this.companyLogoElement);
  
      /**
       * Check if tagline placement is left, if so, remove text anchor middle.
       */
  
      if (!this.rules.tagline) {
        this.companyLogoElement.attr({
          x: '35%',
          y: '10%'
        });
        return draw.svg();
      }
  
      const nameProps = this.companyLogoElement.bbox();
  
      const nameX = 150 - nameProps.w / 2;
      const nameY = -30;
      this.companyNameY = nameY;
  
      this.companyLogoElement.attr({
        x: nameX,
        y: nameY,
      });
    }
  }

  drawCompanyName(draw) {
    /**
     * Check company name casing
     */
    this.companyName = this.setTextCasing(this.companyName, this.rules.name.casing);

    this.companyNameElement = draw.text((add) => {
      add.tspan(this.companyName);
    });
    
    // let words = this.companyName.match(/.{1,15}/g);

    // if (this.companyName.length > 15) {
    //   this.companyNameElement = draw.text((add) => {
    //     words.filter(x => {
    //       add.tspan(x.trim()).attr({
    //         x: '50%',
    //         'text-anchor': 'middle',
    //         'alignment-baseline': 'middle',
    //       }).font({ size: 20 }).newLine();
    //     })
    //   });
    // } else {
    //   this.companyNameElement = draw.text((add) => {
    //     add.tspan(this.companyName).attr({ 'text-anchor': 'middle', }).font({size: this.rules.name.fontSize,});
    //   });
    // }

    this.groupElement.add(this.companyNameElement);

    /**
     * Company name font rules.
     */

    var strLen = this.companyName.length;
     var companyNameFontSize = this.rules.name.fontSize;
    // if(strLen > 20) companyNameFontSize = companyNameFontSize - (strLen - 20);

    this.companyNameElement.font({
      fill: this.companyNameColor,
      family: this.rules.name.fontFamily,
      'letter-spacing': this.rules.name.letterSpacing,
      size: companyNameFontSize
    });

    while(this.companyNameElement.bbox().w > 300){
      companyNameFontSize = companyNameFontSize - 1;
      this.companyNameElement.font({
        size: companyNameFontSize
      });
    }

    /**
     * Company name positioning rules.
     */

    /**
     * Check if tagline placement is left, if so, remove text anchor middle.
     */

    // const nameX = this.companyLogoElement.bbox().x;
    // const nameY = this.companyLogoElement.bbox().y + this.companyLogoElement.bbox().h + 50;

    if (!this.rules.tagline) {
      this.companyNameElement.attr({
        x: '50%',
        y: '70%',
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
      });
      return draw.svg();
    }

    const nameProps = this.companyNameElement.bbox();

    // const nameY = 115 - (nameProps.h);
    // this.companyNameY = nameY;
    const nameX = 150 - nameProps.w / 2;
    const nameY = 115 - (nameProps.h / 4);

    this.companyNameElement.attr({
      x: nameX,
      y: nameY,
    });
  }

  drawTagline(draw) {
    /**
     * Tagline casing rules.
     */
    this.tagline = this.setTextCasing(this.tagline, this.rules.tagline.casing);

    if (this.rules.tagline.taglineWidth) {
      this.taglineElement = draw.text((add) => {
        add.tspan(this.tagline).attr({
          textLength: this.companyNameElement.bbox().w,
        })
      });
    } else {
      this.taglineElement = draw.text((add) => {
        add.tspan(this.tagline);
      });
    }
    // let words = this.tagline.match(/.{1,40}/g);

    // if (this.tagline.length > 40) {
    //   if (this.rules.tagline.taglineWidth) {
    //     this.taglineElement = draw.text((add) => {
    //       words.filter(x => {
    //         add.tspan(x.trim()).attr({
    //           x: '50%',
    //           'text-anchor': 'middle',
    //           'alignment-baseline': 'middle',
    //         }).attr({
    //           textLength: this.companyNameElement.bbox().w,
    //         }).newLine();
    //       })
    //     });
    //   } else {
    //     this.taglineElement = draw.text((add) => {
    //       words.filter(x => {
    //         add.tspan(x.trim()).attr({
    //           x: '50%',
    //         'text-anchor': 'middle',
    //         'alignment-baseline': 'middle',
    //         }).newLine();;
    //       })
    //     });
    //   }
    // } else {
    //   if (this.rules.tagline.taglineWidth) {
    //     this.taglineElement = draw.text((add) => {
    //       words.filter(x => {
    //         add.tspan(x.trim()).attr({
    //           x: '50%',
    //           'text-anchor': 'middle',
    //           'alignment-baseline': 'middle',
    //         }).attr({
    //           textLength: this.companyNameElement.bbox().w,
    //         }).newLine();
    //       })
    //     });
    //   } else {
    //     this.taglineElement = draw.text((add) => {
    //       words.filter(x => {
    //         add.tspan(x.trim()).attr({
    //           x: '50%',
    //           'text-anchor': 'middle',
    //           'alignment-baseline': 'middle',
    //         }).newLine();;
    //       })
    //     });
    //   }
    // }

    this.groupElement.add(this.taglineElement);

    /**
     * Tagline font rules.
     */
    var taglineElementFontSize = this.rules.tagline.fontSize;

    this.taglineElement.font({
      fill: this.taglineColor,
      family: this.rules.tagline.fontFamily,
      weight: this.rules.tagline.fontWeight,
      'letter-spacing': this.rules.tagline.letterSpacing,
      size: taglineElementFontSize
    });

    while(this.taglineElement.bbox().w > 280){
      taglineElementFontSize = taglineElementFontSize - 1;
      this.taglineElement.font({
        size: taglineElementFontSize
      });
    }

    this.taglineElement.attr('id', 'taglineCopy');

    console.log("==>", this.rules.tagline.taglinePlacement)
    switch (this.rules.tagline.taglinePlacement) {
      /**
       * Tagline positioning rules.
       */
      case 'middle': {
        let taglineX;

        taglineX = '50%';
        if (this.rules.tagline.taglineWidth === 'companyNameWidth') {
          this.taglineElement.attr({
            textLength: this.companyNameElement.bbox().w,
            //x: '50%',
            'text-anchor': 'middle',
            'alignment-baseline': 'middle',
          });
        }
        else {
          taglineX = 150 - (this.taglineElement.bbox().w / 2);
        }
        //const taglineY = this.companyNameElement.bbox().y + this.companyNameElement.bbox().h;
        const taglineY = this.companyNameElement.bbox().y + this.companyNameElement.bbox().h + 30;

        this.taglineElement.attr({
          x: taglineX,
          y: taglineY,
        });
        break;
      }

      case 'left': {
        const taglineX = this.companyNameElement.bbox().x;
        const taglineY = this.companyNameElement.bbox().y + this.companyNameElement.bbox().h + 10;

        this.taglineElement.attr({
          //x: '40%',
          x: taglineX,
          y: taglineY,
        });
        break;
      }

      case 'right': {
        //const taglineX = this.taglineElement.bbox().w - 35

        const taglineX = this.companyNameElement.bbox().w -
          this.taglineElement.bbox().w +
          this.companyNameElement.bbox().x;

        const taglineY = this.companyNameElement.bbox().y + this.companyNameElement.bbox().h + 10;

        this.taglineElement.attr({
          x: taglineX - 3,
          y: taglineY,
        });
        break;
      }

      case 'belowAccent': {
        const taglineProps = this.taglineElement.bbox();
        const taglineX = 150 - (taglineProps.w / 2);
        const taglineY = this.companyNameElement.bbox().y + this.companyNameElement.bbox().h + 20;

        this.taglineElement.attr({
          x: taglineX,
          // 'text-anchor': 'middle',
          // 'alignment-baseline': 'middle',
          y: taglineY,
        });
        break;
      }

      default: {
        let taglineX = 0;
        
        //taglineX = '50%';
        if (this.rules.tagline.taglineWidth === 'companyNameWidth') {
          taglineX = '50%';
          this.taglineElement.attr({
            textLength: this.companyNameElement.bbox().w,
            'text-anchor': 'middle',
            'alignment-baseline': 'middle',
          });
        } 
        else {
          taglineX = 150 - (this.taglineElement.bbox().w / 2);
        }
        const taglineY = this.companyNameElement.bbox().y + this.companyNameElement.bbox().h + 30;

        this.taglineElement.attr({
          x: taglineX,
          y: taglineY,
        });
        break;
      }
    }
  }

  drawAccent(draw) {
    const taglineProps = this.taglineElement.bbox();
    let circle;
    let circle2;
    let line;
    let line2;

    switch (this.rules.accent.accentPlacement) {
      case 'linesBothSidesOfTagline': {
        // const spacing = 20;
        // const companyNameWidthDifference = taglineProps.w - spacing;
        // const lineWidth = companyNameWidthDifference / 2;
        if (this.rules.accent.accentWidth > 15) {
          // const taglineWidthWithSpacing = taglineProps.w + spacing;
          const spacing = 20;
          const taglineWidthWithSpacing = taglineProps.w + spacing;
          const companyNameWidthDifference = this.companyNameElement.bbox().w - taglineWidthWithSpacing;
          const lineWidth = companyNameWidthDifference / 2;

          line = draw.line(0, 0, lineWidth, 0).stroke({
            width: 1,
          });
          line2 = draw.line(0, 0, lineWidth, 0).stroke({
            width: 1,
          });
          const lineY = taglineProps.y + (taglineProps.h / 2);
          const lineX = taglineProps.x - lineWidth - 8;
          // console.log(lineX)
          line.attr({
            transform: `translate(${lineX}, ${lineY})`,
          });
          const line2Y = taglineProps.y + (taglineProps.h / 2);
          const line2X = taglineProps.x +
              (taglineProps.w - lineWidth) + lineWidth + 8;
          line2.attr({
            transform: `translate(${line2X}, ${line2Y})`,
          });
        } else {
          line = draw.line(0, 0, this.rules.accent.accentWidth, 0).stroke({
            width: 1,
          });
          line2 = draw.line(0, 0, this.rules.accent.accentWidth, 0).stroke({
            width: 1,
          });
          const lineY = taglineProps.y + (taglineProps.h / 2);
          const lineX = taglineProps.x - this.rules.accent.accentWidth - 8;

          line.attr({
            transform: `translate(${lineX}, ${lineY})`,
          });
          const line2Y = taglineProps.y + (taglineProps.h / 2);
          const line2X = taglineProps.x +
            (taglineProps.w - this.rules.accent.accentWidth) + this.rules.accent.accentWidth + 8;
          line2.attr({
            transform: `translate(${line2X}, ${line2Y})`,
          });
        }
        this.groupElement.add(line);
        this.groupElement.add(line2);
        break;
      }
      case 'lineBetweenNameAndTagline': {
        line = draw.line(0, 0, this.companyNameElement.bbox().w, 0).stroke({
          width: 1,
        });
        const lineY = taglineProps.y - (taglineProps.h / 2) + 6;
        const lineX = 150 - (this.companyNameElement.bbox().w / 2);
        line.attr({
          transform: `translate(${lineX}, ${lineY})`,
        });
        this.groupElement.add(line);
        break;
      }
      case 'left': {
        const spacing = 10;
        const taglineWidthWithSpacing = this.taglineElement.bbox().w + spacing;
        const companyNameWidthDifference = this.companyNameElement.bbox().w - taglineWidthWithSpacing;

        line = draw.line(0, 0, companyNameWidthDifference, 0).stroke({
          width: 5,
          color: this.companyNameColor,
        });
        const lineY = taglineProps.y + (taglineProps.h / 2);
        const lineX = taglineProps.x - companyNameWidthDifference - spacing + 3;
        line.attr({
          transform: `translate(${lineX}, ${lineY})`,
        });
        this.groupElement.add(line);
        break;
      }
      case 'circlesBothSidesOfTagline': {
        circle = draw.circle(3);
        circle2 = draw.circle(3);
        const circleY = taglineProps.y + (taglineProps.h / 2);
        const circleX = taglineProps.x - 11;
        circle.attr({
          transform: `translate(${circleX}, ${circleY})`,
        });
        const circle2Y = taglineProps.y + (taglineProps.h / 2);
        const circle2X = taglineProps.x + (taglineProps.w - 3) + 11;
        circle2.attr({
          transform: `translate(${circle2X}, ${circle2Y})`,
        });
        this.groupElement.add(circle);
        this.groupElement.add(circle2);
        break;
      }
      default: {
        const lineY = taglineProps.y + (taglineProps.h / 2);
        const lineX = taglineProps.x - 23;
        line.attr({
          transform: `translate(${lineX}, ${lineY})`,
        });
        const line2Y = taglineProps.y + (taglineProps.h / 2);
        const line2X = taglineProps.x + (taglineProps.w - 15) + 23;
        line2.attr({
          transform: `translate(${line2X}, ${line2Y})`,
        });
        this.groupElement.add(line);
        this.groupElement.add(line2);
        break;
      }
    }
  }

  setTextCasing(text, casing) {
    switch (casing) {
      case 'lowercase':
        text = text.toLowerCase();
        break;
      case 'uppercase':
        text = text.toUpperCase();
        break;
      case 'pascalcase':
        text = text.replace(/\w+/g, w => w[0].toUpperCase() +
          w.slice(1).toLowerCase());
        break;
      default:
        break;
    }
    return text;
  }

  preloadFonts() {
    window.setFontDir(`${__dirname}/../../fonts`)
      .setFontFamilyMappings({
        'Montserrat': 'Montserrat-Regular.otf',
        'Boogalo': 'Boogaloo-Regular.otf',
        'Montserrat Semibold': 'Montserrat-SemiBold.otf',
        'Montserrat Bold': 'Montserrat-Bold.otf',
        'Abril Fat Face': 'AbrilFatface-Regular.otf',
        'Alex Brush': 'AlexBrush-Regular.ttf',
        'Bebas Neue': 'BebasNeue.otf',
        'Caviar Dreams': 'CaviarDreams.ttf',
        'Caviar Dreams Bold': 'Caviar_Dreams_Bold.ttf',
        'Chunk Five': 'Chunkfive.otf',
        'Cinzel': 'Cinzel-Regular.otf',
        'Cinzel Bold': 'Cinzel-Bold.otf',
        'Dancing Script': 'DancingScript-Regular.otf',
        'Great Vibes': 'GreatVibes-Regular.otf',
        'Happy Monkey': 'HappyMonkey-Regular.ttf',
        'Lato': 'Lato-Regular.ttf',
        'Lato Semi Bold': 'Lato-Semibold.ttf',
        'Lato Bold': 'Lato-Bold.ttf',
        'Lato Medium': 'Lato-Medium.ttf',
        'Oswald': 'Oswald-Regular.ttf',
        'Pacifico': 'Pacifico.ttf',

      }).preloadFonts();
  }
}

module.exports = Logo;

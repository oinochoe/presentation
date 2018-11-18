
paper.install(window);          
paper.setup('myCanvas1'); 

var SSection, Sections, gui, h, mwheel, onFrame, windowHeight, _base, _ref;

Path.prototype.setWidth = function(width) {
  this.segments[3].point.x = this.segments[0].point.x + width;
  return this.segments[2].point.x = this.segments[1].point.x + width;
};

Path.prototype.setHeight = function(height) {
  this.segments[1].point.y = this.segments[0].point.y + height;
  return this.segments[2].point.y = this.segments[3].point.y + height;
};

Path.prototype.reset = function() {
  this.setWidth(0);
  this.setHeight(0);
  return this.smooth();
};

h = {
  getRand: function(min, max) {
    return Math.floor((Math.random() * ((max + 1) - min)) + min);
  }
};

window.PaperSections = {
  $container: $('#wrapper'),
  i: 0,
  next: 0,
  prev: 0,
  scrollSpeed: 0,
  timeOut: null,
  invertScroll: true,
  currSection: -1
};

window.PaperSections.ff = typeof InstallTrigger !== 'undefined';

window.PaperSections.win = navigator.appVersion.indexOf("Win") !== -1;

windowHeight = $(window).outerHeight();

window.PaperSections.$canvas = $(view.canvas);

window.PaperSections.data = window.PaperSections.$canvas.data();

window.PaperSections.data.colors = window.PaperSections.data.colors.split(':');

if ((_ref = (_base = window.PaperSections.data).sectionscount) == null) {
  _base.sectionscount = window.PaperSections.data.colors.length;
}

view.setViewSize(window.PaperSections.$container.outerWidth(), window.PaperSections.data.sectionheight * window.PaperSections.data.sectionscount);

window.PaperSections.data.sectionheight = parseInt(window.PaperSections.data.sectionheight);

window.PaperSections.$content = $("#" + window.PaperSections.data.contentid);

window.PaperSections.$sections = window.PaperSections.$content.children();

window.PaperSections.slice = function(val, max) {
  if (val > 0 && val > max) {
    return Math.min(val, max);
  }
  if (val < 0 && val < max) {
    return Math.max(val, -max);
  }
  return val;
};

SSection = (function() {
  function SSection(o) {
    this.o = o;
    this.w = view.size.width;
    this.h = view.size.height;
    this.ph = 60;
    this.sh = this.procent(this.h, this.ph);
    this.wh = 1 * this.w;
    this.scrollSpeed = 0;
    this.gapSize = this.procent(this.h, (100 - this.ph) / 2);
    this.colors = ['#69d2e7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900'];
    this.twns = [];
    this.getPrefix();
    this.makeBase();
    this.listenToStop();
  }

  SSection.prototype.getPrefix = function() {
    var pre, styles;

    styles = window.getComputedStyle(document.documentElement, "");
    pre = (Array.prototype.slice.call(styles).join("").match(/-(moz|webkit|ms)-/) || (styles.OLink === "" && ["", "o"]))[1];
    this.prefix = "-" + pre + "-";
    return this.transformPrefix = "" + this.prefix + "transform";
  };

  SSection.prototype.listenToStop = function() {
    var _this = this;

    window.PaperSections.$container.on('scroll', function() {
      window.PaperSections.stop = false;
      _this.poped = false;
      return TWEEN.removeAll();
    });
    return window.PaperSections.$container.on('stopScroll', function() {
      var duration;

      window.PaperSections.stop = true;
      duration = window.PaperSections.slice(Math.abs(window.PaperSections.scrollSpeed * 25), 1400) || 3000;
      _this.translatePointY({
        point: _this.base.segments[1].handleOut,
        to: 0,
        duration: duration
      }).then(function() {
        return window.PaperSections.scrollSpeed = 0;
      });
      return _this.translatePointY({
        point: _this.base.segments[3].handleOut,
        to: 0,
        duration: duration
      });
    });
  };

  SSection.prototype.translateLine = function(o) {
    var dfr, it, mTW,
      _this = this;

    dfr = new $.Deferred;
    mTW = new TWEEN.Tween(new Point(o.point)).to(new Point(o.to), o.duration);
    mTW.easing(o.easing || TWEEN.Easing.Elastic.Out);
    it = this;
    mTW.onUpdate(o.onUpdate || function(a) {
      var _ref1;

      o.point.y = this.y;
      return (_ref1 = o.point2) != null ? _ref1.y = this.y : void 0;
    });
    mTW.onComplete(function() {
      return dfr.resolve();
    });
    mTW.start();
    return dfr.promise();
  };

  SSection.prototype.notListenToStop = function() {
    window.PaperSections.$container.off('stopScroll');
    return window.PaperSections.$container.off('scroll');
  };

  SSection.prototype.translatePointY = function(o) {
    var dfr, it, mTW,
      _this = this;

    dfr = new $.Deferred;
    mTW = new TWEEN.Tween(new Point(o.point)).to(new Point(o.to), o.duration);
    mTW.easing(o.easing || TWEEN.Easing.Elastic.Out);
    it = this;
    mTW.onUpdate(o.onUpdate || function(a) {
      o.point.y = this.y;
      !it.poped && window.PaperSections.$content.attr('style', "" + it.transformPrefix + ": translate3d(0," + (this.y / 2) + "px,0);transform: translate3d(0," + (this.y / 2) + "px,0);");
      return (it.poped && !it.popedCenter) && window.PaperSections.$sections.eq(it.index).attr('style', "" + it.transformPrefix + ": translate3d(0," + (this.y / 2) + "px,0);transform: translate3d(0," + (this.y / 2) + "px,0);");
    });
    mTW.onComplete(function() {
      return dfr.resolve();
    });
    mTW.start();
    return dfr.promise();
  };

  SSection.prototype.makeBase = function() {
    this.base = new Path.Rectangle(new Point(0, this.o.offset), [this.wh, this.o.height]);
    return this.base.fillColor = this.o.color;
  };

  SSection.prototype.toppie = function(amount) {
    this.base.segments[1].handleOut.y = amount;
    return this.base.segments[1].handleOut.x = this.wh / 2;
  };

  SSection.prototype.bottie = function(amount) {
    this.base.segments[3].handleOut.y = amount;
    return this.base.segments[3].handleOut.x = -this.wh / 2;
  };

  SSection.prototype.createPath = function(o) {
    var path;

    path = new Path(o.points);
    o.flatten && path.flatten(o.flatten);
    path.fillColor = o.fillColor || 'transparent';
    return path;
  };

  SSection.prototype.update = function() {
    if (!window.PaperSections.stop && !this.poped) {
      this.toppie(window.PaperSections.scrollSpeed);
      this.bottie(window.PaperSections.scrollSpeed);
      window.PaperSections.$content.attr('style', "" + this.transformPrefix + ": translate3d(0," + (window.PaperSections.scrollSpeed / 2) + "px,0);transform: translate3d(0," + (window.PaperSections.scrollSpeed / 2) + "px,0);");
    }
    return TWEEN.update();
  };

  SSection.prototype.procent = function(base, percents) {
    return (base / 100) * percents;
  };

  SSection.prototype.pop = function() {
    var _this = this;

    this.poped = true;
    this.popedCenter = true;
    this.translatePointY({
      point: this.base.segments[1].handleOut,
      to: -window.PaperSections.data.sectionheight / 1.75,
      duration: 100,
      easing: TWEEN.Easing.Linear.None
    }).then(function() {
      _this.translatePointY({
        point: _this.base.segments[1].handleOut,
        to: 0
      }).then(function() {});
      return _this.translatePointY({
        point: _this.base.segments[3].handleOut,
        to: 0
      });
    });
    return this.translatePointY({
      point: this.base.segments[3].handleOut,
      to: window.PaperSections.data.sectionheight / 1.75,
      duration: 100,
      easing: TWEEN.Easing.Linear.None
    });
  };

  SSection.prototype.popUP = function() {
    var _this = this;

    this.poped = true;
    this.popedCenter = false;
    this.translatePointY({
      point: this.base.segments[1].handleOut,
      to: -window.PaperSections.data.sectionheight / 1.75,
      duration: 100,
      easing: TWEEN.Easing.Linear.None
    }).then(function() {
      _this.translatePointY({
        point: _this.base.segments[1].handleOut,
        to: 0
      }).then(function() {});
      return _this.translatePointY({
        point: _this.base.segments[3].handleOut,
        to: 0
      });
    });
    return this.translatePointY({
      point: this.base.segments[3].handleOut,
      to: -window.PaperSections.data.sectionheight / 1.75,
      duration: 100,
      easing: TWEEN.Easing.Linear.None
    });
  };

  SSection.prototype.popDOWN = function() {
    var _this = this;

    this.poped = true;
    this.popedCenter = false;
    this.translatePointY({
      point: this.base.segments[1].handleOut,
      to: window.PaperSections.data.sectionheight / 1.75,
      duration: 100,
      easing: TWEEN.Easing.Linear.None
    }).then(function() {
      _this.translatePointY({
        point: _this.base.segments[1].handleOut,
        to: 0
      }).then(function() {});
      return _this.translatePointY({
        point: _this.base.segments[3].handleOut,
        to: 0
      });
    });
    return this.translatePointY({
      point: this.base.segments[3].handleOut,
      to: window.PaperSections.data.sectionheight / 1.75,
      duration: 100,
      easing: TWEEN.Easing.Linear.None
    });
  };

  return SSection;

})();

Sections = (function() {
  function Sections() {
    var i, section, _i, _ref1, _ref2;

    if ((_ref1 = this.contents) == null) {
      this.contents = [];
    }
    for (i = _i = _ref2 = window.PaperSections.data.sectionscount; _ref2 <= 0 ? _i <= 0 : _i >= 0; i = _ref2 <= 0 ? ++_i : --_i) {
      section = new SSection({
        offset: (i * window.PaperSections.data.sectionheight) - 5,
        height: window.PaperSections.data.sectionheight + 5,
        color: window.PaperSections.data.colors[i]
      });
      section.index = i;
      this.contents.push(section);
    }
    $(window).trigger('menu:ready');
  }

  Sections.prototype.update = function() {
    var i, it, _i, _len, _ref1, _results;

    _ref1 = this.contents;
    _results = [];
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      it = _ref1[i];
      _results.push(it.update());
    }
    return _results;
  };

  Sections.prototype.popSection = function(n) {
    var i, _i, _ref1, _results;

    TWEEN.removeAll();
    _results = [];
    for (i = _i = _ref1 = this.contents.length - 1; _ref1 <= 0 ? _i <= 0 : _i >= 0; i = _ref1 <= 0 ? ++_i : --_i) {
      if (i > this.contents.length - n - 1) {
        this.contents[i].popUP();
      }
      if (this.contents.length - n - 1 === i) {
        this.contents[i].pop();
      }
      if (i < this.contents.length - n - 1) {
        _results.push(this.contents[i].popDOWN());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Sections.prototype.teardown = function() {
    var i, _i, _ref1, _results;

    _results = [];
    for (i = _i = _ref1 = this.contents.length - 1; _ref1 <= 0 ? _i <= 0 : _i >= 0; i = _ref1 <= 0 ? ++_i : --_i) {
      this.contents[i].base.remove();
      this.contents[i].notListenToStop();
      _results.push(delete this.contents[i]);
    }
    return _results;
  };

  return Sections;

})();

$(window).on('menu:ready', function(){
   window.PaperSections.$container.find('.menu-l').addClass('is-loaded')
}); 

window.PaperSections.sections = new Sections;

view.onFrame = function(e) {
  return window.PaperSections.sections.update();
};

mwheel = function(e, d) {
  var $$, $content;

  $content = $('#js-content');
  $$ = $(this);
  if ($$.scrollTop() === 0 && d > 0) {
    e.stopPropagation();
    e.preventDefault();
  }
  if (d < 0 && ($$.scrollTop() === ($content[0].scrollHeight - window.PaperSections.$container.height()))) {
    e.stopPropagation();
    return e.preventDefault();
  }
};

window.PaperSections.$container.on('mousewheel', mwheel);

window.PaperSections.scrollControl = function(e, d) {
  var direction;

  clearTimeout(window.PaperSections.timeOut);
  window.PaperSections.timeOut = setTimeout(function() {
    window.PaperSections.i = 0;
    window.PaperSections.$container.trigger('stopScroll');
    return window.PaperSections.prev = window.PaperSections.$container.scrollTop();
  }, 50);
  if (window.PaperSections.i % 4 === 0) {
    direction = window.PaperSections.invertScroll ? -1 : 1;
    window.PaperSections.next = window.PaperSections.$container.scrollTop();
    window.PaperSections.scrollSpeed = direction * window.PaperSections.slice(1.2 * (window.PaperSections.next - window.PaperSections.prev), window.PaperSections.data.sectionheight / 2);
    window.PaperSections.prev = window.PaperSections.next;
  }
  window.PaperSections.i++;
  return false;
};

window.PaperSections.$container.scroll(window.PaperSections.scrollControl);

gui = new dat.GUI;

gui.add(window.PaperSections, 'invertScroll');

window.PaperSections.$container.on('mouseenter', '.section-b', function() {
  return window.PaperSections.currSection = $(this).index();
});

window.PaperSections.$container.on('click', '.section-b', function() {
  var $$;

  $$ = $(this);
  return window.PaperSections.sections.popSection($$.index());
});

if (window.PaperSections.win || window.PaperSections.ff) {
  window.PaperSections.$container.addClass('is-with-scroll');
}
 


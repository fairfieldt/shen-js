shen_web = (function() {
  var self = {};
  self.init = function(opts) {
    function init(fn) {
      function load_index(fn) {
        self.query("web/fs.json", function(data) {
          var def = JSON.parse(data);
          var index = [];
          for (var i = 0; i < def.length; ++i) {
            var d = def[i];
            for (var j = 0; j < d.files.length; ++j) {
              var f = d.files[j];
              index.push({src: d.from + "/" + f, dst: d.to + "/" + f});
            }
          }
          fn(index);
        }, function(err) {
          fn([]);
        });
      }

      function load_files(entries, i, fn) {
        if (i < entries.length) {
          shen_web.query(entries[i].src, function(data) {
            var w = entries[i].dst;
            shen_web.fs.root.put(w, data);
            load_files(entries, i + 1, fn);
          }, function(err) {
            load_files(entries, i + 1, fn);
          });
        } else {
          fn();
        }
      }

      load_index(function(index) {
        load_files(index, 0, function() {
          if (fn)
            fn();
        });
      });
    }

    function init_ui(where) {
      shen_web.init_repl();
      shen_web.edit.init(function(path) {
        console.log("TODO: send (load path) to shen", path);
      });
      shen_web.fs.init(function(file, path) {
        if (file.type === "f")
          shen_web.edit.load(shen_web.fs.root, path);
        else
          shen_web.edit.unload();
      });
    }

    function script(file, fn) {
      var s = document.createElement("script")
      s.type = "text/javascript";
      s.src = file;
      s.async = true;
      document.head.appendChild(s);
    }
    var files = ["web/util.js", "web/fs.js", "web/edit.js", "web/repl.js",
                 "runtime.js"];
    files.forEach(script);

    window.onload = function() {
      window.onerror = function(msg) {
        var p = document.getElementById("wait_pane"),
            t = document.getElementById("wait_text"),
            img = document.getElementById("wait_progress");
        p.classList.add("wait_error");
        while (t.firstChild)
          t.removeChild(t.firstChild);
        t.appendChild(document.createTextNode("Error occured: " + msg));
        p.removeChild(img);
      };
      init_ui();
      init(function() {
        window.onhashchange = function() {
          var path = location.hash.replace(/^#/, "");
          console.log("onhashchange " + path);
          if (path === "")
            shen_web.edit.unload();
          else
            shen_web.edit.load(shen_web.fs.root, path);
        };
        if (opts && opts.ondone)
          opts.ondone();
        var wait = document.getElementById("wait_frame");
        wait.parentNode.removeChild(wait);
        window.onerror = null;
      });
    };
  }
  return self;
})();

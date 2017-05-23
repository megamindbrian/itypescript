class $TS {
    static holdAsync() {
        global.$$async$$ = true;
    }

    static unholdAsync() {
        global.$$async$$ = false;
    }

    static retrieve(result?: any) {
        global.$$done$$(result);
    }

    static put(mimeType: string, obj: string) {
        let result = {};
        result[mimeType] = obj;
        global.$$.mime(result);
        global.$$.done();
    }

    static screen(url: string, options: any) {
        global.$$.async();
        const encode = require('base64-stream').encode();
        const spawn = require('child_process').spawn;
        const myOptions = []
            .concat.apply(['-q', '-f', 'jpeg'], Object.keys(options || {}).map(k => ['--' + k, options[k]]));
        const wk = spawn('xvfb-run', ['-a', '-s', '-screen 0 640x480x16', 'wkhtmltoimage',
            ...myOptions,
            url, '-']);
        let out = '';
        wk.stdout.pipe(encode).on('data', d => out += d.toString()).on('finish', () => $TS.jpg(out));
    }

    static exec(cmd: string) {
        global.$$.async();
        $TS.unholdAsync();
        var child = require("child_process").exec(cmd, function (err, stdout, stderr) {
            console.log(err);
            console.log(stdout);
            console.log(stderr);
            global.$$.done();
        });
        child.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        child.stderr.on('data', function (data) {
            console.log(data.toString());
        });
    }

    static boot(files: string) {
        global.$$.async();
        var path = require('path');
        var webpack = require('webpack');
        var config = require(path.join(files, 'webpack.config.js'));
        var tag = Math.random().toString(36).substring(7);
        var fs = require('fs');
        var moduleFile = '../src/app.component.ts';

        fs.readFile(moduleFile, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(/'bc-app(-.*)?'/ig, '\'bc-app-' + tag + '\'');

            fs.writeFile(moduleFile, result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });

        webpack(config, function (err, stats) {
            if (err) {
                return console.log(err);
            }
            // console.log(stats);
            $TS.html('<iframe src="/files/dev/www/index.html"></iframe>');
        });
    }

    static html(html: string) {
        $TS.put("text/html", html);
    }

    static svg(xml: string) {
        $TS.put("image/svg+xml", xml);
    }

    static png(base64: string) {
        $TS.put("image/png", base64);
    }

    static pngFile(path: string) {
        let base64 = require("fs").readFileSync(path).toString("base64");
        $TS.png(base64);
    }

    static jpg(base64: string) {
        $TS.put("image/jpeg", base64);
    }

    static jpgFile(path: string) {
        let base64 = require("fs").readFileSync(path).toString("base64");
        $TS.jpg(base64);
    }

    static log(text: string) {
        $TS.put("text/plain", text);
    }

    static throw(error: Error) {
        global.$$.sendError(error);
    }
}

"use strict";
class FetchApi {
    constructor(arg) {
        this.prepareList = [];
        this.successList = [];

        this.isReady = false;
        this.pmt = null;


        if (arg instanceof Request) this._request = arg;
        else {

            if (typeof arg === "object") {
                this._request = new Request(arg.url || "", arg);
            }
            else if (typeof arg !== "string") {
                arg = "";
                this._request = new Request(arg);
            }
            this._headers = this._request.headers;

        }
    }

    get(url) {
        this.url = url;
        this.method = "GET";

        return this;
    }

    post(url, str) {
        this.url = url;
        if (typeof str === "string") this.body = str;
        this.method = "POST";

        return this;
    }

    setHeader(name, value) {
        this.headers.set(name, value);
        this.ready();

        return this;
    }

    appendHeader(name, value) {
        this.headers.append(name, value);
        this.ready();

        return this;
    }

    prepare(fn) {
        if (typeof fn === "function") this.prepareList.push(fn);

        return this;
    }

    success(fn) {
        if (typeof fn === "function") this.successList.push(fn);

        return this;
    }

    error(err) {
        if (typeof err === "function") {
            this._error = err;
        }

        return this;
    }

    ready() {
        function _fetch() {
            var i;

            for (i = 0; i < this.prepareList.length; ++i) {
                this.prepareList[i]();
            }

            this.pmt = fetch(this._request.clone());
            this.pmt.then(_finishFetch.bind(this));
        }

        function _finishFetch() {
            var i;

            this.pmt = this.pmt.then(function(res) {
                if (!res.ok) throw new Error(res.status + " _-_ " + res.statusText + " : " + res.url);
                return res;
            });

            for (i = 0; i < this.successList.length; ++i) {
                this.pmt = this.pmt.then(this.successList[i]);
            }

            if (i === 0) this.pmt = this.pmt.then(function(res) {console.log(res)});

            this.pmt.catch(this._error || function(rej) {console.log(rej)});

            this.isReady = false;
        }

        if (!this.isReady) {
            this.isReady = true;
            setTimeout(_fetch.bind(this), 0);
        }

        return this;
    }

    get request() {
        return this._request;
    }

    set request(req) {
        if (req instanceof Request && req !== this._request) {

            this._request = req;
            this._headers = this._request.headers;
            this._body = "";

            this.ready();
        }
    }

    get headers() {
        return this._headers;
    }

    set headers(hds) {
        if (hds instanceof Headers && hds !== this._headers) {

            this._request = new Request(this._request.url, {
                method : this._request.method,
                headers : hds,
                body : this._body
            });
            this._headers = this._request.headers;

            this.ready();
        }
    }

    get body() {
        return this._body;
    }

    set body(bd) {
        if (typeof bd === "string" && bd !== this._body) {

            this._body = bd;
            this._request = new Request(this._request.url, {
                method : (/GET|HEAD/i.test(this._request.method)) ? "POST" : this._request.method,
                headers : this._headers,
                body : this._body
            });
            this._headers = this._request.headers;

            this.ready();
        }
    }

    get url() {
        return this._request.url;
    }

    set url(url) {
        if (typeof url === "string" && url !== this._request.url) {

            if (/GET|HEAD/i.test(this._request.method)) {
                this._request = new Request(url, {
                    method : this._request.method,
                    headers : this._headers
                });
            }
            else {
                this._request = new Request(url, {
                    method: this._request.method,
                    headers: this._headers,
                    body: this._body
                });
            }
            this._headers = this._request.headers;

            this.ready();
        }
    }

    get method() {
        return this._request.method;
    }

    set method(m) {
        if (typeof m === "string" && m !== this._request.method) {

            if (/GET|HEAD/i.test(this._request.method)) {
                this._request = new Request(this._request.url, {
                    method : m,
                    headers : this._headers
                });
            }
            else {
                this._request = new Request(this._request.url, {
                    method : m,
                    headers : this._headers,
                    body : this._body
                });
            }
            this._headers = this._request.headers;

            this.ready();
        }
    }
}
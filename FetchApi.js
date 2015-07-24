"use strict";
class FetchApi {

    constructor(url) {
        this.successList = [];


        var isReady = false;
        var pmt;

        this.ready =  function() {
            if (!isReady) {
                isReady = true;
                pmt = fetch(this._request);
                pmt.then(this.finishFetch);
            }
        };

        this.finishFetch = function() {
            var i;
            for (i = 0; i < this.successList.length; ++i) {
                pmt = pmt.then(this.successList[i]);
            }
            if (i === 0) pmt = pmt.then(function(res) {console.log(res)});
            pmt.catch(this._error || function(rej) {console.log(rej)});
            isReady = false;
        }.bind(this);


        if (url instanceof Request) this.request = url;
        else {
            if (typeof url !== "string") url = "";
            this.request = new Request(url);
        }
    }

    get(url) {
        this.url = url;
        this.method = "GET";
    }

    post(url, str) {
        this.url = url;
        this.body = str;
        this.method = "POST";
    }

    pre() {}

    success(fn) {}

    error(err) {
        if (typeof err === "function") {
            this._error = err;
        }
    }

    get request() {
        return this._request;
    }

    set request(req) {
        if (req instanceof Request && req !== this._request) {
            this._request = req;
            this._headers = req.headers;
            this._body = "";
            this.ready();
        }
    }

    get headers() {
        return this._headers;
    }

    set headers(hds) {
        if (hds instanceof Headers && hds !== this._headers) {
            this._headers = hds;
            this.request = new Request(this._request.url, {
                method : this._request.method,
                headers : this._headers,
                body : this._body
            });
            this.ready();
        }
    }

    get body() {
        return this._body;
    }

    set body(bd) {
        if (typeof bd === "string" && bd !== this._body) {
            this._body = bd;
            this.request = new Request(this._request.url, {
                method : (/GET|HEAD/i.test(this._request.method)) ? "POST" : this._request.method,
                headers : this._headers,
                body : this._body
            });
            this.ready();
        }
    }

    get url() {
        return this._request.url;
    }

    set url(url) {
        if (typeof url === "string" && url !== this._request.url) {
            this.request = new Request(url, {
                method : this._request.method,
                headers : this._headers,
                body : this._body
            });
            this.ready();
        }
    }

    get method() {
        return this._request.method;
    }

    set method(m) {
        if (typeof m === "string" && m !== this._request.method) {
            if (m === "GET" || m === "HEAD") {
                this.request = new Request(this._request.url, {
                    method : m,
                    headers : this._headers
                });
            }
            else {
                this.request = new Request(this._request.url, {
                    method : m,
                    headers : this._headers,
                    body : this._body
                });
            }
            this.ready();
        }
    }
}
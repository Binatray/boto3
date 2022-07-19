
webpackJsonp([1], {
    0: function (t, e) {
    }, GrZq: function (t, e) {
    }, L8S8: function (t, e) {
    }, NHnr: function (t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", {value: !0});
        var o = n("7+uW"), r = {
            render: function () {
                var t = this.$createElement, e = this._self._c || t;
                return e("div", {attrs: {id: "app"}}, [e("router-view")], 1)
            }, staticRenderFns: []
        };
        var s = n("VU/8")({name: "App"}, r, !1, function (t) {
            n("ymcE")
        }, null, null).exports, i = n("/ocq"), a = {
            render: function () {
                var t = this, e = t.$createElement, n = t._self._c || e;
                return n("div", {staticClass: "div-table"}, [n("div", {staticClass: "div-table-row"}, t._l(t.columns, function (e, o) {
                    return n("div", {staticClass: "div-table-col"}, [t._v(t._s(e))])
                })), t._v(" "), t._l(t.tableData, function (e, o) {
                    return n("div", {staticClass: "div-table-row"}, t._l(e, function (e, o) {
                        return n("div", {staticClass: "div-table-col"}, [t._v(t._s(e))])
                    }))
                })], 2)
            }, staticRenderFns: []
        };
        var l = n("VU/8")({
            name: "Table", props: ["columns", "tableData"], data: function () {
                return {}
            }
        }, a, !1, function (t) {
            n("cOlk")
        }, "data-v-6c8eb09a", null).exports, u = {
            render: function () {
                var t = this.$createElement;
                return (this._self._c || t)("div", [this._v("Loading........")])
            }, staticRenderFns: []
        };
        var c = n("VU/8")({name: "Loading"}, u, !1, function (t) {
                n("L8S8")
            }, "data-v-241276bc", null).exports, d = n("T1ft"), h = n.n(d), v = n("Zrlr"), f = n.n(v), m = n("wxAW"),
            _ = n.n(m), p = function () {
                function t(e) {
                    f()(this, t), this._holder = e
                }

                return _()(t, [{
                    key: "register", value: function () {
                        var e = {
                            identifierRegexps: [/[^\s]+/], getCompletions: function (e, n, o, r, s) {
                                s(null, t.keywords().concat(t.datasources(), t.models()).filter(function (t) {
                                    return t.includes(r)
                                }).map(function (t) {
                                    return {value: t, meta: "code"}
                                }))
                            }
                        };
                        this._holder.lang_tools().addCompleter(e)
                    }
                }], [{
                    key: "keywords", value: function () {
                        return ["load", "save", "train", "register", "options", "connect", "options", "partitionBy", "append", "overwrite", "errorIfExists", "ignore", ""]
                    }
                }, {
                    key: "datasources", value: function () {
                        return ["parquet", "json", "csv", "image"]
                    }
                }, {
                    key: "models", value: function () {
                        return ["PythonAlg", "ConfusionMatrix", "TfIdfInPlace", "RateSampler"]
                    }
                }, {
                    key: "functions", value: function () {
                        return ["onehot"]
                    }
                }]), t
            }(), b = function () {
                function t(e) {
                    f()(this, t), this._holder = e
                }

                return _()(t, [{
                    key: "selection", value: function () {
                        var t = this._holder.editor(), e = t.getSelectionRange();
                        return t.session.getTextRange(e)
                    }
                }]), t
            }(), g = function () {
                function t(e) {
                    f()(this, t), this._ace = n("kX7f");
                    var o = e.$children.filter(function (t) {
                        return "editor" === t.$options._componentTag
                    })[0];
                    this._editor = o.editor, this._lang_tool = this._ace.acequire("ace/ext/language_tools"), this._tool = new b(this)
                }

                return _()(t, [{
                    key: "tool", value: function () {
                        return this._tool
                    }
                }, {
                    key: "editor", value: function () {
                        return this._editor
                    }
                }, {
                    key: "lang_tools", value: function () {
                        return this._lang_tool
                    }
                }, {
                    key: "ace", value: function () {
                        return this._ace
                    }
                }]), t
            }(), w = function () {
                function t(e) {
                    f()(this, t), this._holder = e.holder
                }

                return _()(t, [{
                    key: "register", value: function () {
                        var t = this._holder;
                        t.editor().commands.addCommand({
                            name: "expand",
                            bindKey: {win: "Tab", mac: "Tab"},
                            exec: function (e) {
                                var n = e.getCursorPosition(), o = e.session.getLine(n.row),
                                    r = t.ace().acequire("ace/range").Range;
                                "load" === o.trim() && e.session.replace(new r(n.row, 0, n.row, n.column), "load parquet.`[path]`\noptions [key]=[value]\nas [tableName];\n"), "save" === o.trim() && e.session.replace(new r(n.row, 0, n.row, n.column), "save append [tableName] as parquet.`[path]`\noptions [key]=[value]\npartitionBy [column];\n"), "train" === o.trim() && e.session.replace(new r(n.row, 0, n.row, n.column), "train [tableName] [moduleName].`[path]` where [key]=[value];\n"), "register" === o.trim() && e.session.replace(new r(n.row, 0, n.row, n.column), "register [moduleName].`[path]` as [functionName] options [key]=[value];\n")
                            }
                        })
                    }
                }]), t
            }(), y = n("kKhF"), k = function () {
                function t(e) {
                    f()(this, t), this.main = e, this._holder = e.holder
                }

                return _()(t, [{
                    key: "register", value: function () {
                        this._holder, this._holder.editor().getSession()
                    }
                }, {
                    key: "getTrainLine", value: function () {
                        var t = this._holder.ace().acequire("ace/range").Range, e = this._holder.editor(),
                            n = e.getSession(), o = e.getCursorPosition(), r = n.getTextRange(new t(0, 0, o.row, o.column));
                        console.log(y(r).split(";")), console.log(r)
                    }
                }, {
                    key: "isTrain", value: function () {
                    }
                }]), t
            }(), j = n("gRE1"), x = n.n(j), C = n("BO1k"), J = n.n(C), S = n("CqLJ"), T = function () {
                function t() {
                    f()(this, t)
                }

                return _()(t, null, [{
                    key: "formatStartTime", value: function (t) {
                        var e = !0, n = !1, o = void 0;
                        try {
                            for (var r, s = J()(t); !(e = (r = s.next()).done); e = !0) {
                                var i = r.value;
                                i.startTime = S(new Date(i.startTime), "yyyy:mm:dd HH:MM:ss")
                            }
                        } catch (t) {
                            n = !0, o = t
                        } finally {
                            try {
                                !e && s.return && s.return()
                            } finally {
                                if (n) throw o
                            }
                        }
                    }
                }, {
                    key: "groupBy", value: function (t, e) {
                        return t.reduce(function (t, n) {
                            return (t[n[e]] = t[n[e]] || []).push(n), t
                        }, {})
                    }
                }]), t
            }(), R = function () {
                function t(e) {
                    f()(this, t);
                    this.http = e, this.resource = {
                        batch_jobs_url: "/runningjobs",
                        stream_jobs_url: "/stream/jobs/running",
                        kill_stream_jobs_url: "/stream/jobs/kill",
                        kill_batch_jobs_url: "/killjob",
                        job_url: "/run/script"
                    }
                }

                return _()(t, [{
                    key: "submitJob", value: function (t) {
                        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : function () {
                        }, n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : function () {
                        }, o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : function (t) {
                        }, r = [], s = [], i = this.resource.job_url;
                        return e(), this.http.post(i, t, {emulateJSON: !0}).then(function (t) {
                            n();
                            var e = t.data, o = [], i = {};
                            e.forEach(function (t) {
                                for (var e in t) i[e] || (o.push(e), i[e] = !0)
                            }), r.push.apply(r, o), e.forEach(function (t) {
                                var e = {};
                                o.forEach(function (n) {
                                    e[n] = t[n]
                                }), s.push(e), console.log(s)
                            })
                        }, function (t) {
                            o(t.bodyText)
                        }), {columns: r, tableData: s}
                    }
                }, {
                    key: "killJob", value: function (t, e) {
                        var n = this.resource.kill_stream_jobs_url;
                        "stream" != t && (n = this.resource.kill_batch_jobs_url);
                        var o = [];
                        return this.http.post(n, {groupId: e}, {emulateJSON: !0}).then(function (t) {
                            o.push(!0)
                        }, function (t) {
                            o.push(!1)
                        }), o
                    }
                }, {
                    key: "fetchJobs", value: function () {
                        var t = this, e = [], n = {emulateJSON: !0};
                        return t.http.post(t.resource.stream_jobs_url, {}, n).then(function (o) {
                            var r = T.groupBy(o.data, "owner");
                            for (var s in r) T.formatStartTime(r[s]), e.push({owner: s, jobs: r[s]});
                            t.http.post(t.resource.batch_jobs_url, {}, n).then(function (t) {
                                var n = T.groupBy(x()(t.data), "owner");
                                for (var o in n) T.formatStartTime(n[o]), e.push({owner: o, jobs: n[o]})
                            }, function (t) {
                            })
                        }, function (t) {
                        }), e
                    }
                }]), t
            }(), L = n("DtRx"), N = {
                name: "Query", data: function () {
                    return {
                        msg: "MLSQL is cool",
                        content: "select 1 as a,'jack' as b as bbc;",
                        editor_options: {enableBasicAutocompletion: !0, enableSnippets: !1, enableLiveAutocompletion: !0},
                        resource: {job_url: "/run/script", kill_job_url: "/killjob"},
                        holder: {},
                        result: {
                            columns: [],
                            tableData: [],
                            msg: "",
                            loading: !1,
                            editor_modes: [{id: 0, label: "正常模式"}, {id: 1, label: "vim模式"}],
                            editor_mode_selected: {id: 0, label: "正常模式"}
                        },
                        completer: {show: !1}
                    }
                }, methods: {
                    editorInit: function () {
                        n("R3yc"), n("2i/5"), n("QWRE");
                        this.holder = new g(this), new p(this.holder).register(), new w(this).register(), new k(this).register()
                    }, submitRunSQL: function (t) {
                        var e = this;
                        e.jobName = L(), e.result.loading = !0, e.result.tableData = [], e.result.columns = [], e.result.msg = "";
                        var n = e.holder.tool().selection(), o = e.content;
                        "" != n && (o = n);
                        var r = new R(e.$http).submitJob({sql: o, owner: "admin", jobName: e.jobName}, function () {
                            e.result.loading = !0
                        }, function () {
                            e.result.loading = !1
                        }, function (t) {
                            e.result.loading = !1, e.result.msg = t
                        });
                        e.result.columns = r.columns, e.result.tableData = r.tableData
                    }
                }, components: {editor: n("o4sT"), vtable: l, vloading: c, vSelect: h.a}
            }, E = {
                render: function () {
                    var t = this, e = t.$createElement, n = t._self._c || e;
                    return n("div", {staticClass: "query_box"}, [n("div", {staticClass: "editor_mode_select"}, [n("span", [t._v("编辑器模式")]), t._v(":\n    "), n("vSelect", {
                        attrs: {options: t.result.editor_modes},
                        model: {
                            value: t.result.editor_mode_selected, callback: function (e) {
                                t.$set(t.result, "editor_mode_selected", e)
                            }, expression: "result.editor_mode_selected"
                        }
                    })], 1), t._v(" "), n("div", {staticClass: "dropdown-menu"}, [t.completer.show ? n("vSelect", {
                        attrs: {options: t.result.editor_modes},
                        model: {
                            value: t.result.editor_mode_selected, callback: function (e) {
                                t.$set(t.result, "editor_mode_selected", e)
                            }, expression: "result.editor_mode_selected"
                        }
                    }) : t._e()], 1), t._v(" "), n("div", {attrs: {id: "editor"}}, [n("editor", {
                        attrs: {
                            lang: "sql",
                            theme: "twilight",
                            width: "100%",
                            height: "300px",
                            options: t.editor_options
                        }, on: {init: t.editorInit}, model: {
                            value: t.content, callback: function (e) {
                                t.content = e
                            }, expression: "content"
                        }
                    }), t._v(" "), n("div", [n("button", {
                        staticClass: "btn btn-run waves-effect",
                        attrs: {id: "runButton"},
                        on: {click: t.submitRunSQL}
                    }, [t._v("运行")]), t._v(" "), n("a", {
                        staticClass: "btn btn-run waves-effect",
                        staticStyle: {"text-decoration": "none"},
                        attrs: {href: "#/stream/jobs"}
                    }, [t._v("任务列表")])]), t._v(" "), t.result.loading ? n("vloading") : t._e()], 1), t._v(" "), n("div", {attrs: {id: "show_result"}}, ["" != t.result.msg ? n("editor", {
                        attrs: {
                            lang: "text",
                            width: "100%",
                            height: "100px"
                        }, model: {
                            value: t.result.msg, callback: function (e) {
                                t.$set(t.result, "msg", e)
                            }, expression: "result.msg"
                        }
                    }) : t._e(), t._v(" "), t.result.tableData.length > 0 ? n("vtable", {
                        attrs: {
                            "table-data": t.result.tableData,
                            columns: t.result.columns
                        }
                    }) : t._e()], 1)])
                }, staticRenderFns: []
            };
        var $ = n("VU/8")(N, E, !1, function (t) {
            n("X4ei")
        }, "data-v-78076e1f", null).exports, q = {
            name: "StreamJobs", data: function () {
                return {usersWithJobs: []}
            }, mounted: function () {
                this.fetchJobList()
            }, methods: {
                killJob: function (t, e) {
                    var n = new R(this.$http);
                    n.killJob(t, e), this.usersWithJobs = n.fetchJobs()
                }, fetchJobList: function () {
                    var t = new R(this.$http);
                    this.usersWithJobs = t.fetchJobs()
                }
            }, components: {}
        }, D = {
            render: function () {
                var t = this, e = t.$createElement, n = t._self._c || e;
                return n("div", {staticClass: "stream-jobs-list"}, [t._m(0), t._v(" "), t._l(this.usersWithJobs, function (e) {
                    return n("div", {staticClass: "job-boarder"}, [n("header", [t._v("用户:" + t._s(e.owner))]), t._v(" "), t._l(e.jobs, function (e) {
                        return n("div", {staticClass: "job-card-detail"}, [n("div", {staticClass: "job-item"}, [n("span", [t._v(t._s(e.jobName))]), t._v(" "), n("div", {staticClass: "job-item-content"}, [t._v("任务类型：" + t._s(e.jobType))]), t._v(" "), n("div", {staticClass: "job-item-content"}, [t._v("任务内容：" + t._s(e.jobContent))]), t._v(" "), n("div", {staticClass: "job-item-content"}, [t._v("任务启动时间：" + t._s(e.startTime))]), t._v(" "), n("button", {
                            on: {
                                click: function (n) {
                                    t.killJob(e.jobType, e.groupId)
                                }
                            }
                        }, [t._v("关闭任务")])])])
                    })], 2)
                })], 2)
            }, staticRenderFns: [function () {
                var t = this.$createElement, e = this._self._c || t;
                return e("div", [e("a", {
                    staticClass: "btn btn-run waves-effect",
                    staticStyle: {"text-decoration": "none"},
                    attrs: {href: "#/"}
                }, [this._v("返回")])])
            }]
        };
        var B = n("VU/8")(q, D, !1, function (t) {
            n("GrZq")
        }, "data-v-43c7dc06", null).exports;
        o.a.use(i.a);
        var A = new i.a({
            routes: [{path: "/", name: "Query", component: $}, {
                path: "/stream/jobs",
                name: "streamJobs",
                component: B
            }]
        }), I = n("8+8L");
        o.a.config.productionTip = !1, o.a.use(I.a), o.a.http.options.xhr = {withCredentials: !0}, new o.a({
            el: "#app",
            router: A,
            components: {App: s},
            template: "<App/>"
        })
    }, X4ei: function (t, e) {
    }, cOlk: function (t, e) {
    }, ymcE: function (t, e) {
    }
}, ["NHnr"]);
//# sourceMappingURL=app.303d85c440faff98c47f.js.map
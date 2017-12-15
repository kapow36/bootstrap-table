(function ($)
{
    $.fn.bootstrapTable = function (dataOrAction, columns, options, pageLoadedEvent)
    {
        var data = dataOrAction;

        if (columns)
        {
            this.each(function ()
            {
                var _this = $(this);

                var filteredData = data;

                if (!_this.is("table"))
                {
                    throw "bootstrap-table must be a table";
                }

                //data attributes
                var pageSize = _this.data("page-size");
                var isDateUTC = _this.data("is-date-utc");
                var isSearchable = _this.data("is-searchable");
                var search = _this.data("search");
                var sortColumn = _this.data("sort-column");
                var sortAsc = _this.data("sort-asc");
                var page = _this.data("page");

                //options
                if (options)
                {
                    pageSize = options.pageSize ? options.pageSize : pageSize;
                    isDateUTC = options.isDateUTC ? options.isDateUTC : isDateUTC;
                    isSearchable = options.isSearchable ? options.isSearchable : isSearchable;
                    search = options.search ? options.search : search;
                    sortColumn = options.sortColumn ? options.sortColumn : sortColumn;
                    sortAsc = options.sortAsc ? options.sortAsc : sortAsc;
                    page = options.page ? options.page : page;
                }

                //defaults
                pageSize = pageSize ? pageSize : 10;
                isDateUTC = isDateUTC ? isDateUTC : false;
                isSearchable = isSearchable ? isSearchable : false;
                search = search ? search : "";
                sortColumn = sortColumn ? sortColumn : null;
                sortAsc = sortAsc ? sortAsc : false;
                page = page ? page : 1;
                _this.data("page-size", pageSize);
                _this.data("is-date-utc", isDateUTC);
                _this.data("is-searchable", isSearchable);
                _this.data("search", search);
                _this.data("sort-column", sortColumn);
                _this.data("sort-asc", sortAsc);
                _this.data("page", page);

                //generate html
                var tableContent = "<thead>";

                if (isSearchable)
                {
                    tableContent += "<tr><td colspan='42'>";
                    tableContent += "<div class='input-group pull-right'>";
                    tableContent += "<input class='form-control input-sm' id='search-input' value='" + search + "'/>";
                    tableContent += "<span class='input-group-btn'>";
                    tableContent += "<button type='button' class='btn btn-default btn-sm' id='search-input-btn'><span class='glyphicon glyphicon-search'></span></button>";
                    tableContent += "</span></div></td></tr>";
                }
                tableContent += "<tr class='header'>";
                var columnKeys = Object.keys(columns);
                for (var i = 0; i < columnKeys.length; i++)
                {
                    tableContent += "<th><a href='#' data-column='" + columnKeys[i] + "'>" + columns[columnKeys[i]] + "&nbsp;<span></span></a></th>";
                }
                tableContent += "</tr></thead><tbody></tbody><tfoot>";
                tableContent += "<tr><td colspan='42'>";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnFirst'><span class='glyphicon glyphicon-step-backward'/></button>&nbsp;";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnPrevious'><span class='glyphicon glyphicon-triangle-left'/></button>&nbsp;&nbsp;&nbsp;";
                tableContent += "<label>Page</label>&nbsp;<input class='form-control input-sm' style='display:inline-block; width:65px;' id='txtPageNumber' value='1'/>&nbsp;<label>of</label>&nbsp;<label id='lblPageTotal'></label>&nbsp;&nbsp;&nbsp;";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnNext'><span class='glyphicon glyphicon-triangle-right'/></button>&nbsp;";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnLast'><span class='glyphicon glyphicon-step-forward'/></button>";
                tableContent += "</td></tr>";
                tableContent += "</tfoot>";

                _this.empty().append(tableContent);

                //events
                _this.find("#btnFirst").click(function ()
                {
                    loadPage(_this, filteredData, columnKeys, 1, pageLoadedEvent);
                });

                _this.find("#btnPrevious").click(function ()
                {
                    loadPage(_this, filteredData, columnKeys, _this.data("page") - 1, pageLoadedEvent);
                });

                _this.find("#btnNext").click(function ()
                {
                    loadPage(_this, filteredData, columnKeys, _this.data("page") + 1, pageLoadedEvent);
                });

                _this.find("#btnLast").click(function ()
                {
                    loadPage(_this, filteredData, columnKeys, Math.ceil(data.length / _this.data("page-size")), pageLoadedEvent);
                });

                _this.find("#txtPageNumber").keyup(function ()
                {
                    loadPage(_this, filteredData, columnKeys, $(this).val(), pageLoadedEvent);
                });

                _this.find("thead a").click(function ()
                {
                    var span = $(this).find("span");
                    if (span.hasClass("glyphicon glyphicon-sort-by-attributes"))
                    {
                        sort(_this, filteredData, columnKeys, $(this), false, pageLoadedEvent);
                    }
                    else if (span.hasClass("glyphicon glyphicon-sort-by-attributes-alt"))
                    {
                        sort(_this, filteredData, columnKeys, $(this), true, pageLoadedEvent);
                    }
                    else
                    {
                        sort(_this, filteredData, columnKeys, $(this), true, pageLoadedEvent);
                    }
                });

                _this.find("#search-input-btn").on("click", function ()
                {
                    filteredData = data;

                    var searchTerm = _this.find("#search-input").val().toLowerCase();
                    _this.data("search", searchTerm);
                    if (searchTerm != "")
                    {
                        // Sort data and reload page
                        filteredData = data.filter(function (dataObject)
                        {
                            var columnKeys = Object.keys(dataObject);
                            for (var i = 0; i < columnKeys.length; i++)
                            {
                                if (dataObject[columnKeys[i]] != null && dataObject[columnKeys[i]].toString().toLowerCase().indexOf(searchTerm) >= 0)
                                {
                                    return true;
                                }
                            }
                            return false;
                        });
                    }
                    // Check if the current page is above the pageCount
                    // Assign pageCount to the current page if it is
                    var pageCount = filteredData.length > 0 ? Math.ceil(filteredData.length / pageSize) : 1;
                    var page = _this.data("page") > pageCount ? pageCount : _this.data("page");
                    _this.data("page", page);

                    if (_this.data("sort-col") != null)
                    {
                        var sortColumnHeader = _this.find("thead a[data-column='" + _this.data("sort-col") + "']");

                        sort(_this, filteredData, columns, sortColumnHeader, _this.data("sort-asc"), pageLoadedEvent);
                    }
                    else
                    {
                        // Reload the filtered data
                        loadPage(_this, filteredData, columnKeys, page, pageLoadedEvent);
                    }
                });

                // LOAD THE DATA
                loadPage(_this, filteredData, columnKeys, page, pageLoadedEvent);

                // If a sort column was provided or is on the data attribute, sort
                if (sortColumn != null)
                {
                    var sortColumnHeader = _this.find("thead a[data-column='" + sortColumn + "']");

                    sort(_this, filteredData, columnKeys, sortColumnHeader, sortAsc, pageLoadedEvent);
                }

                // If searching is enabled, and is prepopulated then click the input button
                if (search != "" && isSearchable == true)
                {
                    _this.find("#search-input-btn").click();
                }
            });
        }
        else
        {
            if (dataOrAction == "next")
            {
                this.find("#btnNext").click();
            }
            else if (dataOrAction == "previous")
            {
                this.find("#btnPrevious").click();
            }
            else if (dataOrAction == "first")
            {
                this.find("#btnFirst").click();
            }
            else if (dataOrAction == "last")
            {
                this.find("#btnLast").click();
            }
            else if (dataOrAction == "hasNext")
            {
                if (this.find("#txtPageNumber").val() != this.find("#lblPageTotal").text())
                {
                    return true;
                }
                return false;
            }
            else if (dataOrAction == "hasPrevious")
            {
                if (this.find("#txtPageNumber").val() != "1")
                {
                    return true;
                }
                return false;
            }
            else
            {
                throw action + " does not exist for $.bootstrapTable()";
            }
        }

        function sort(table, data, columns, columnHeader, sortAsc, pageLoadedEvent)
        {
            //icons
            table.find("thead a span").removeClass("glyphicon glyphicon-sort-by-attributes").removeClass("glyphicon glyphicon-sort-by-attributes-alt");

            // Set the data attributes on the table
            table.data("sort-asc", sortAsc);
            table.data("sort-column", columnHeader.data("column"));

            if (sortAsc === true)
            {
                columnHeader.find("span").addClass("glyphicon glyphicon-sort-by-attributes");
            }
            else
            {
                columnHeader.find("span").addClass("glyphicon glyphicon-sort-by-attributes-alt");
            }

            //sort data
            var sortColumn = columnHeader.data("column");
            var sortedData = data.sort(function (a, b)
            {
                var va = (a[sortColumn] === null) ? "" : "" + a[sortColumn],
                    vb = (b[sortColumn] === null) ? "" : "" + b[sortColumn];

                //try converting to number
                va = (isNaN(va)) ? va : padFilter(va, "00000000000000000000");
                vb = (isNaN(vb)) ? vb : padFilter(vb, "00000000000000000000");

                //try converting to date
                va = (isDateString(va)) ? new Date(va) : va;
                vb = (isDateString(vb)) ? new Date(vb) : vb;

                return va > vb === sortAsc ? 1 : (va === vb ? 0 : -1);
            });

            //load page
            loadPage(table, sortedData, columns, table.data("page"), pageLoadedEvent);
        }

        function loadPage(table, data, columns, page, pageLoadedEvent)
        {
            //get and update page count
            var pageSize = table.data("page-size");
            var pageCount = data.length > 0 ? Math.ceil(data.length / pageSize) : 1;
            table.find("#lblPageTotal").text(pageCount);

            if (data.length <= 0)
            {
                table.find("tbody").empty().append('<tr><td colspan="42"><p>&nbsp;&nbsp;&nbsp;No Rows Found</p></td></tr>');
            }

            if (page > 0 && data.length > 0 && page <= pageCount)
            {
                //populate rows
                var tableBodyContent = "";
                var pageData = data.slice((page - 1) * pageSize, page * pageSize);
                for (var i = 0; i < pageData.length; i++)
                {
                    tableBodyContent += "<tr";
                    var columnKeys = Object.keys(pageData[i]);
                    for (var j = 0; j < columnKeys.length; j++)
                    {
                        var content = pageData[i][columnKeys[j]];
                        if (table.data("is-date-utc") === true && isDateString(content) === true)
                        {
                            content = new Date(content + " UTC").toLocaleString();
                        }
                        tableBodyContent += " data-" + columnKeys[j] + "='" + content + "'";
                    }
                    tableBodyContent += ">";

                    for (var j = 0; j < columns.length; j++)
                    {
                        var content = pageData[i][columns[j]] == null ? "" : pageData[i][columns[j]];
                        if (table.data("is-date-utc") === true && isDateString(content) === true)
                        {
                            content = new Date(content + " UTC").toLocaleString();
                        }
                        tableBodyContent += "<td>" + content + "</td>";
                    }
                    tableBodyContent += "</tr>";
                }
                table.find("thead th:not(:has(a))").remove();
                table.find("tbody").empty().append(tableBodyContent);

                //update page number
                table.data("page", page);
                table.find("#txtPageNumber").val(page);

                //fire event
                pageLoadedEvent(table.find("thead tr.header,tbody tr"));
            }
            else
            {
                if (page !== "")
                {
                    table.find("#txtPageNumber").val(table.data("page"));
                }
            }
        }

        //Return true if string 'value' is a string of a date
        //Looks for format DD/MM/YYYY HH:MM:SS. A number not in this format that still may be a date creates a log message and returns false.
        function isDateString(value)
        {
            if (/^\d{1,2}\/\d\d\/\d\d\d\d \d{1,2}:\d\d:\d\d/.test(value))
                return true;

            if (/^\d{1,4}(\/|\\|\-)\d{1,4}(\/|\\|\-)\d{1,4}/.test(value))
                console.log("Value " + value + " has been read as a non-date by the application but may be a date. Use the format DD/MM/YYYY HH:MM:SS.");

            return false;
        }

        function padFilter(str, pad)
        {
            return (pad + str).slice(-pad.length);
        };

        return this;
    };
}(jQuery));
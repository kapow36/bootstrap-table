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

                if (!_this.is("table"))
                {
                    throw "bootstrap-table must be a table";
                }

                var filteredData = convertDatesInDataToDateObjects(_this, data);

                //data attributes
                var pageSize = _this.data("page-size");
                var isDateUTC = _this.data("is-date-utc");
                var isSearchable = _this.data("is-searchable");
                var search = _this.data("search");
                var sortColumn = _this.data("sort-column");
                var sortAsc = _this.data("sort-asc");
                var page = _this.data("page");
                var areColumnsRemovable = _this.data("are-columns-removable");

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
                    areColumnsRemovable = options.areColumnsRemovable ? options.areColumnsRemovable : areColumnsRemovable;
                }

                //defaults
                pageSize = pageSize ? pageSize : 10;
                isDateUTC = isDateUTC ? isDateUTC : false;
                isSearchable = isSearchable ? isSearchable : false;
                search = search ? search : "";
                sortColumn = sortColumn ? sortColumn : null;
                sortAsc = sortAsc ? sortAsc : false;
                page = page ? page : 1;
                areColumnsRemovable = areColumnsRemovable ? areColumnsRemovable : false;
                _this.data("page-size", pageSize);
                _this.data("is-date-utc", isDateUTC);
                _this.data("is-searchable", isSearchable);
                _this.data("search", search);
                _this.data("sort-column", sortColumn);
                _this.data("sort-asc", sortAsc);
                _this.data("page", page);
                _this.data("are-columns-removable", areColumnsRemovable);

                //generate html
                var tableContent = "<thead>";

                //set up column data
                var columnKeys = Object.keys(columns);
                for (var i = 0; i < columnKeys.length; i++)
                {
                    if (!columns[columnKeys[i]].Name)
                    {
                        columns[columnKeys[i]] = { Name: columns[columnKeys[i]], IsVisible: true };
                    }
                }

                if (isSearchable || areColumnsRemovable)
                {
                    //header row
                    tableContent += "<tr><td colspan='42'>";
                    tableContent += "<div class='pull-right'>";
                    tableContent += "<form class='form-inline' onsubmit='return false;'>";

                    //column select
                    if (areColumnsRemovable)
                    {
                        tableContent += "<div class='btn-group column-select-dropdown'>";
                        tableContent += "<button type='button' class='btn btn-default btn-sm dropdown-toggle' title='Filter Columns' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' style='margin-right:10px;'><span class='glyphicon glyphicon-th-list'></span></button>";

                        tableContent += "<ul class='dropdown-menu' onclick='event.stopPropagation();'>";
                        for (var i = 0; i < columnKeys.length; i++)
                        {
                            tableContent += "<li><a href='#' style='padding:0;'><label style='width:100%; padding: 3px 20px; margin:0; cursor:pointer;'><input class='column-select-chk' type='checkbox' value='" + columnKeys[i] + "' ";
                            if (columns[columnKeys[i]].IsVisible === true)
                            {
                                tableContent += "checked='checked'";
                            }
                            tableContent += "/>&nbsp;" + columns[columnKeys[i]].Name + "<label></a></li>";
                        }
                        tableContent += "</ul>";
                        tableContent += "</div>";
                    }

                    //search input
                    if (isSearchable)
                    {
                        tableContent += "<div class='input-group'>";
                        tableContent += "<input class='form-control input-sm' id='searchInput' placeholder='Search' value='" + search + "'/>";
                        tableContent += "<span class='input-group-btn'>";
                        tableContent += "<button type='button' class='btn btn-default btn-sm' id='searchInputBtn'><span class='glyphicon glyphicon-search'></span></button>";
                        tableContent += "</span>";
                        tableContent += "</div>";
                    }


                    //end header row
                    tableContent += "</form>";
                    tableContent += "</div>";
                    tableContent += "</td></tr>";
                }

                tableContent += "<tr class='header'>";

                for (var i = 0; i < columnKeys.length; i++)
                {
                    if (columns[columnKeys[i]].IsVisible === true)
                    {
                        tableContent += "<th class='bootstrap-table-auto-generated'><a href='#' data-column='" + columnKeys[i] + "'>" + columns[columnKeys[i]].Name + "&nbsp;<span></span></a></th>";
                    }
                }

                tableContent += "</tr></thead><tbody></tbody><tfoot>";
                tableContent += "<tr><td colspan='42'>";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnFirst' title='First Page'><span class='glyphicon glyphicon-step-backward'/></button>&nbsp;";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnPrevious' title='Previous Page'><span class='glyphicon glyphicon-triangle-left'/></button>&nbsp;&nbsp;&nbsp;";
                tableContent += "<label>Page</label>&nbsp;<input class='form-control input-sm' style='display:inline-block; width:65px;' id='txtPageNumber' value='1'/>&nbsp;<label>of</label>&nbsp;<label id='lblPageTotal'></label>&nbsp;&nbsp;&nbsp;";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnNext' title='Next Page'><span class='glyphicon glyphicon-triangle-right'/></button>&nbsp;";
                tableContent += "<button type='button' class='btn btn-default btn-sm' id='btnLast' title='Last Page'><span class='glyphicon glyphicon-step-forward'/></button>";
                tableContent += "</td></tr>";
                tableContent += "</tfoot>";

                _this.empty().append(tableContent);

                //events
                _this.find("#btnFirst").click(function ()
                {
                    loadPage(_this, filteredData, columns, 1, pageLoadedEvent);
                });

                _this.find("#btnPrevious").click(function ()
                {
                    loadPage(_this, filteredData, columns, _this.data("page") - 1, pageLoadedEvent);
                });

                _this.find("#btnNext").click(function ()
                {
                    loadPage(_this, filteredData, columns, _this.data("page") + 1, pageLoadedEvent);
                });

                _this.find("#btnLast").click(function ()
                {
                    loadPage(_this, filteredData, columns, Math.ceil(data.length / _this.data("page-size")), pageLoadedEvent);
                });

                _this.find("#txtPageNumber").keyup(function ()
                {
                    loadPage(_this, filteredData, columns, $(this).val(), pageLoadedEvent);
                });

                _this.on("click", "thead th > a", function ()
                {
                    var span = $(this).find("span");
                    if (span.hasClass("glyphicon glyphicon-sort-by-attributes"))
                    {
                        sort(_this, filteredData, columns, $(this), false, pageLoadedEvent);
                    }
                    else if (span.hasClass("glyphicon glyphicon-sort-by-attributes-alt"))
                    {
                        sort(_this, filteredData, columns, $(this), true, pageLoadedEvent);
                    }
                    else
                    {
                        sort(_this, filteredData, columns, $(this), true, pageLoadedEvent);
                    }
                });

                _this.find("#searchInputBtn").click(function ()
                {
                    filteredData = searchTable(_this, data, columns, page, pageLoadedEvent);
                });

                _this.find("#searchInput").keypress(function (e) 
                {
                    if (e.keyCode == 13) //Enter
                    {
                        filteredData = searchTable(_this, data, columns, page, pageLoadedEvent);
                    }
                });

                _this.find(".column-select-chk").click(function ()
                {
                    columns[$(this).val()].IsVisible = $(this).prop("checked");
                });

                _this.find(".column-select-dropdown").off().on("hidden.bs.dropdown", function ()
                {
                    _this.bootstrapTable(data, columns, null, pageLoadedEvent);
                });

                // Check if the current page is above the pageCount
                // Assign 1 to the current page if it is, this is different than setting the page number text
                var pageCount = filteredData.length > 0 ? Math.ceil(filteredData.length / pageSize) : 1;
                var page = _this.data("page") > pageCount ? 1 : _this.data("page");
                _this.data("page", page);

                // If searching is enabled, and is prepopulated then click the input button
                if (search != "" && isSearchable == true)
                {
                    _this.find("#searchInputBtn").click();
                }
                // If a sort column was provided or is on the data attribute, sort
                else if (sortColumn != null)
                {
                    var sortColumnHeader = _this.find("thead a[data-column='" + sortColumn + "']");
                    sort(_this, filteredData, columns, sortColumnHeader, sortAsc, pageLoadedEvent);
                }
                else
                {
                    // LOAD THE DATA                
                    loadPage(_this, filteredData, columns, page, pageLoadedEvent);
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
                va = (isNaN(va)) ? va.toLowerCase() : padFilter(va, "00000000000000000000");
                vb = (isNaN(vb)) ? vb.toLowerCase() : padFilter(vb, "00000000000000000000");

                return va > vb === sortAsc ? 1 : (va === vb ? 0 : -1);
            });

            //load page
            loadPage(table, sortedData, columns, table.data("page"), pageLoadedEvent);
        }

        function searchTable(table, data, columns, page, pageLoadedEvent) 
        {
            var filteredData = data;
            var columnKeys = Object.keys(columns);

            var searchTerm = table.find("#searchInput").val().toLowerCase();
            table.data("search", searchTerm);
            if (searchTerm != "")
            {
                // Sort data and reload page
                filteredData = data.filter(function (dataObject)
                {
                    for (var i = 0; i < columnKeys.length; i++)
                    {
                        if (columns[columnKeys[i]].IsVisible === true
                            && dataObject[columnKeys[i]] != null
                            && dataObject[columnKeys[i]].toString().toLowerCase().indexOf(searchTerm) >= 0)
                        {
                            return true;
                        }
                    }
                    return false;
                });
            }

            // Check if the current page is above the pageCount
            // Assign pageCount to the current page if it is
            var pageCount = filteredData.length > 0 ? Math.ceil(filteredData.length / table.data("page-size")) : 1;
            var page = table.data("page") > pageCount ? pageCount : table.data("page");
            table.data("page", page);

            if (table.data("sort-col") != null)
            {
                var sortColumnHeader = table.find("thead a[data-column='" + table.data("sort-col") + "']");

                sort(table, filteredData, columns, sortColumnHeader, table.data("sort-asc"), pageLoadedEvent);
            }
            else
            {
                // Reload the filtered data
                loadPage(table, filteredData, columns, page, pageLoadedEvent);
            }

            return filteredData;
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
                    var dataColumnKeys = Object.keys(pageData[i]);
                    for (var j = 0; j < dataColumnKeys.length; j++)
                    {
                        var content = pageData[i][dataColumnKeys[j]];

                        tableBodyContent += " data-" + dataColumnKeys[j] + "='" + content + "'";
                    }
                    tableBodyContent += ">";

                    var columnKeys = Object.keys(columns);
                    for (var j = 0; j < columnKeys.length; j++)
                    {
                        if (columns[columnKeys[j]].IsVisible === true)
                        {
                            var content = pageData[i][columnKeys[j]] == null ? "" : pageData[i][columnKeys[j]];

                            tableBodyContent += "<td>" + content + "</td>";
                        }
                    }
                    tableBodyContent += "</tr>";
                }
                table.find("thead th:not(.bootstrap-table-auto-generated,.bootstrap-table-persistent)").remove();
                table.find("tbody").empty().append(tableBodyContent);

                //update page number
                table.data("page", page);
                table.find("#txtPageNumber").val(page);

                //add data changed events
                table.find("tr").off().on("dataChange", function ()
                {
                    var index = $(this).index();

                    for (var i = 0; i < dataColumnKeys.length; i++)
                    {
                        pageData[index][dataColumnKeys[i]] = $(this).data(dataColumnKeys[i].toLowerCase());
                    }
                });

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

        function convertDatesInDataToDateObjects(table, data)
        {
            if (data.length > 0)
            {
                for (var i = 0; i < data.length; i++)
                {
                    var dataColumnKeys = Object.keys(data[i]);
                    for (var j = 0; j < dataColumnKeys.length; j++)
                    {
                        var content = data[i][dataColumnKeys[j]];
                        if (table.data("is-date-utc") == true && isDateString(content) === true)
                        {
                            data[i][dataColumnKeys[j]] = new Date(content + " UTC").toLocaleString();
                        }
                    }
                }
            }

            return data;
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

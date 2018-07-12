interface BootstrapTableOptions
{
	pageSize?: number;
	isDateUTC?: boolean;
	isSearchable?: boolean;
	search?: string;
	sortCol?: string;
	sortAsc?: boolean;
}

type BootstrapTableActions = "next" | "previous" | "first" | "last";
type BootstrapTableCheckActions = "hasNext" | "hasPrevious";

interface JQuery
{
    bootstrapTable(data: any, columns: any, options?: BootstrapTableOptions, pageLoadedEvent?: Function): JQuery;
    bootstrapTable(action: BootstrapTableActions): JQuery;
    bootstrapTable(action: BootstrapTableCheckActions): boolean;
}

export interface Entity {
	parentEntity: Entity|null;
	uuid: number;
	clsid: string;
	bpid: string|null;

	saveCustomData?: (data:Record<string, any>)=>void;
	loadCustomData?: (data:Record<string, any>)=>void;
}

import {EntityLoader} from "./EntityLoader";

export abstract class Entity {
	protected constructor(
		public readonly clsid: string,
		public readonly bpid: string|null,
		public readonly uuid: number
	) {}
	parentEntity: Entity|null;

	beforeSave?(ctx: EntityLoader): void;
	afterLoad?(ctx: EntityLoader): void;
	saveCustomData?(data:Record<string, any>, ctx:EntityLoader):void;
	loadCustomData?(data:Record<string, any>, ctx:EntityLoader):void;
}

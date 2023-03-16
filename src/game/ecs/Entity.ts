export abstract class Entity {
	protected constructor(
		public readonly clsid: string,
		public readonly bpid: string|null,
		public readonly uuid: number
	) {}
	parentEntity: Entity|null;

	saveCustomData?(data:Record<string, any>):void;
	loadCustomData?(data:Record<string, any>):void;
}

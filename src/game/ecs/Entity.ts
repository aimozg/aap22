import {EntityLoader} from "./EntityLoader";
import {GameEventHandlers, GameEventMap, GameEventType} from "./GameEvent";
import {LogManager} from "../../utils/logging/LogManager";

let logger = LogManager.loggerFor("Entity");

export abstract class Entity {
	protected constructor(
		public readonly clsid: string,
		public readonly bpid: string | null,
		public readonly uuid: number
	) {}

	parentEntity: Entity | null = null;
	hooks: GameEventHandlers | null = null;

	beforeSave?(ctx: EntityLoader): void;

	afterLoad?(ctx: EntityLoader): void;

	saveCustomData?(data: Record<string, any>, ctx: EntityLoader): void;

	loadCustomData?(data: Record<string, any>, ctx: EntityLoader): void;

	dispatchEvent<T extends GameEventType>(type: T, event: GameEventMap[T]) {
		this.hooks?.[type]?.(event);
	}
}

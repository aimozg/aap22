/*
 * Created by aimozg on 20.03.2023.
 */

import {ISidebar} from "./ScreenManager";
import {Game} from "../Game";
import Chars from "../../utils/ui/chars";
import jsx from "texsaur";
import {itemNameSpan} from "./utils";
import {KeyCodes} from "../../utils/ui/KeyCodes";

export class DefaultSidebar implements ISidebar {

	inventoryMode = false;
	itemIndex = 0;
	handleKeyEvent(hk: string): boolean {
		let gc = Game.gameController;
		if (!gc.playerCanAct) return false;
		let player = Game.state.player;
		if (this.inventoryMode) {
			let item = player.inventory[this.itemIndex];
			switch (hk) {
				case KeyCodes.KEYI:
				case KeyCodes.ESCAPE:
					this.inventoryMode = false;
					break;
				case KeyCodes.ARROWUP:
					this.itemIndex = (this.itemIndex+player.inventory.length-1)%player.inventory.length;
					break;
				case KeyCodes.ARROWDOWN:
					this.itemIndex = (this.itemIndex+1)%player.inventory.length;
					break;
				case KeyCodes.ENTER:
				case KeyCodes.SPACE:
					if (item && item.equipable) {
						gc.playerSmartEquip(item);
						this.inventoryMode = false;
					} else if (item && item.usable) {
						gc.actUseOnSelf(player, item);
						this.inventoryMode = false;
					}
					break;
				case KeyCodes.KEYD:
					if (item) {
						gc.actDropInventoryItem(player, item);
						this.inventoryMode = false;
					}
					break;
				case KeyCodes.KEYU:
					if (item && item.usable) {
						gc.actUseOnSelf(player, item);
						this.inventoryMode = false;
					}
					break;
			}
			return true;
		} else {
			switch (hk) {
				case KeyCodes.KEYI:
					this.inventoryMode = true;
					this.itemIndex = 0;
					return true;
			}
		}
		return false;
	}

	render(container: Element): void {
		let player = Game.state.player;
		container.append(`Seed ${Game.state.seed}\n`);
		container.append(
			<span class={Game.state.level.cleared?"text-blue":""}>Dungeon level {Game.state.depth}</span>);
		container.append(<br/>);
		container.append(<br/>);
		container.append(`Hero level ${player.level}\n`);
		container.append("HP: ");
		for (let n = 1; n <= player.hpMax; n++) {
			if (player.hp >= n) container.append(<span class="text-green">{Chars.SQUARE_WHITE}</span>);
			else container.append(<span class="text-red">{Chars.SQUARE_BLACK}</span>)
			if (n%10 === 0 && n < player.hpMax) container.append("\n    ");
		}
		container.append('\n');
		container.append(`Aim   : ${String(player.aim).padStart(3,' ')}%\n`);
		container.append(`Dodge : ${String(player.dodge).padStart(3,' ')}%\n`);
		container.append(`Damage: ${String(player.damage).padStart(3,' ')}\n`);

		container.append("\n");
		container.append("Weapon: ");
		container.append(itemNameSpan(player.weapon))
		container.append("\n");
		container.append("Armor : ");
		container.append(itemNameSpan(player.armor))
		container.append("\n");

		container.append("\n");
		if (this.inventoryMode) {
			container.append(<span class="text-hl">Inventory:</span>);
		} else {
			container.append("Inventory:");
		}
		container.append("\n");
		for (let i = 0; i < player.inventory.length; i++){
			let item = player.inventory[i];
			if (this.inventoryMode && this.itemIndex === i) {
				container.append(<span class="text-hl">&gt;</span>)
			} else {
				container.append(" ")
			}
			container.append(itemNameSpan(item));
			container.append("\n");
		}
	}

}

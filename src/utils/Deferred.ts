/*
 * Created by aimozg on 17.07.2022.
 */
export class Deferred<T> extends Promise<T> {
	constructor(executor?: (resolve: (value: T | PromiseLike<T>) => void, reject?: (reason?: unknown) => void) => void) {
		let resolveFn:(value:T|PromiseLike<T>)=>void,
			rejectFn:(reason?:unknown)=>void;
		let status = { resolved: false, rejected: false };
		super((resolve,reject)=>{
			resolveFn = t => {
				status.resolved = true;
				resolve(t)
			};
			rejectFn = t => {
				status.rejected = true;
				reject(t);
			}
			if (executor) executor(resolve, reject);
		});
		this.status = status;
		this.resolve = resolveFn!;
		this.reject = rejectFn!;
	}
	private status: {resolved:boolean, rejected:boolean};
	get resolved() { return this.status.resolved }
	get rejected() { return this.status.rejected }
	get completed() { return this.status.resolved || this.status.rejected }
	readonly resolve:(value:T|PromiseLike<T>)=>void;
	readonly reject:(reason?:unknown)=>void;
	tryResolve(value:T|PromiseLike<T>) {
		if (!this.completed) this.resolve(value)
	}
}

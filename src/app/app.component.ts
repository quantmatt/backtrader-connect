import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, interval} from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';
import * as moment from 'moment';

interface RequestItem {
	request_type: string,
	source: string,
	dest_collection: string,
	dest_key: string,
	timestamp: Date
}

interface RequestItemLocal{
	request_type: string,
	source: string,
	dest_collection: string,
	dest_key: string,
	timestamp: Date,
	key: string
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	

	requestCollectionRef: AngularFirestoreCollection<RequestItem>;
	items: Observable<any[]>;
	livefeeds: Observable<any[]>;	
	
	isLive = new Map<string, string>();
	
	title = 'Backtrader Connect';
	
	constructor(db: AngularFirestore) {
	
		this.items = db.collection('strategy_status').valueChanges({ idField: 'key' });
		this.livefeeds = db.collection('strategy_requests', ref => ref.where('request_type', '==', 'subscription')).valueChanges({ idField: 'key' });
		this.requestCollectionRef = db.collection<RequestItem>('strategy_requests');
		
		
		let self = this;
		this.livefeeds.subscribe((items: RequestItemLocal[]) => {		
			this.isLive = new Map<string, string>();		
			items.forEach(function (value) {
				self.isLive.set(value.dest_key, value.key);
			});
    });
	}
	
	
	generateArray(obj){
	   return Object.keys(obj).map((key)=>{ return {key:key, value:obj[key]}});
	}
	
	getSnapshot(key: string) {	
		this.requestCollectionRef.add({ request_type: 'snapshot',
																		source: key,
																		dest_collection: 'strategy_status',
																		dest_key: key,
																		timestamp: null});
	}
	
	hasLivefeed(key: string) {		
		return this.isLive.has(key);
		
	}
	
	startLiveFeed(key: string) {	
	
		this.bumpFeed(key);

		interval(60000).pipe(
				 takeWhile(() => this.isLive.has(key)))
			.subscribe(() => {
					this.bumpFeed(key);
			});
		
	}
	
	stopLiveFeed(key: string) {		
		this.requestCollectionRef.doc(this.isLive.get(key)).delete();		
	}
	
	bumpFeed(key) {
		let now = moment.utc().toDate();
		this.requestCollectionRef.doc(key).set({ request_type: 'subscription',
																				source: key,
																				dest_collection: 'strategy_status',
																				dest_key: key,
																				timestamp: now});
	}
}

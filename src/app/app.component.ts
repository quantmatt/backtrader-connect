import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	items: Observable<any[]>;
	title = 'Backtrader Connect';
	constructor(db: AngularFirestore) {
		this.items = db.collection('strategy_status').valueChanges({ idField: 'key' });
	}
	
	generateArray(obj){
	   return Object.keys(obj).map((key)=>{ return {key:key, value:obj[key]}});
	}
}

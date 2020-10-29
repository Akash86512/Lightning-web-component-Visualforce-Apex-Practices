import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
const fields = [
	'Customer__c.Name',
	'Customer__c.Location__Latitude__s',
	'Customer__c.Location__Longitude__s'
];
export default class CustomerLocation extends LightningElement {
	@api recordId;
	@track name;
	@track mapMarkers = [];
	@wire(getRecord, { recordId: '$recordId', fields })
	loadCustomer({ error, data }) {
		if (error) {
		} else if (data) {
			this.name = data.fields.Name.value;
			const Latitude = data.fields.Location__Latitude__s.value;
			const Longitude = data.fields.Location__Longitude__s.value;
			this.mapMarkers = [{
				location: { Latitude, Longitude },
				title: this.name,
				description: `Coords: ${Latitude}, ${Longitude}`
			}];
		}
	}
	get cardTitle() {
		return (this.name) ? `${this.name}'s location` : 'Customer location';
	}
}
import { LightningElement, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CUSTOMER__C_OBJECT from '@salesforce/schema/Customer__c';
import FULL_NAME__C_FIELD from '@salesforce/schema/Customer__c.Full_Name__c';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';

export default class CreateNewRecord extends NavigationMixin(LightningElement){
    accountId;
    name = '';

    url;
    currentPageReference;
    // Injects the page reference that describes the current page
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;

        if (this.connected) {
            // We need to have the currentPageReference, and to be connected before
            // we can use NavigationMixin
            this.generateUrls();
        } else {
            // NavigationMixin doesn't work before connectedCallback, so if we have 
            // the currentPageReference, but haven't connected yet, queue it up
            this.generateUrlOnConnected = true;
        }
    }

    showPanelUrl;
    noPanelUrl;

    // Determines the display for the component's panel
    get showPanel() {
        // Derive this property's value from the current page state
        return this.currentPageReference &&
            this.currentPageReference.state.c__showPanel == 'true';
    }

    generateUrls() {
        this[NavigationMixin.GenerateUrl](this.showPanelPageReference)
            .then(url => this.showPanelUrl = url);
        this[NavigationMixin.GenerateUrl](this.noPanelPageReference)
            .then(url => this.noPanelUrl = url);
    }

    // Returns a page reference that matches the current page
    // but sets the 'c__showPanel' page state property to 'true'
    get showPanelPageReference() {
        return this.getUpdatedPageReference({
            c__showPanel: 'true' // Value must be a string
        });
    }

    // Returns a page reference that matches the current page
    // but removes the 'c__showPanel' page state property
    get noPanelPageReference() {
        return this.getUpdatedPageReference({
            // Removes this property from the state
            c__showPanel: undefined
        });
    }

    // Utility function that returns a copy of the current page reference
    // after applying the stateChanges to the state on the new copy
    getUpdatedPageReference(stateChanges) {
        // The currentPageReference property is read-only.
        // To navigate to the same page with a modified state,
        // copy the currentPageReference and modify the copy.
        return Object.assign({}, this.currentPageReference, {
            // Copy the existing page state to preserve other parameters
            // If any property on stateChanges is present but has an undefined
            // value, that property in the page state is removed.
            state: Object.assign({}, this.currentPageReference.state, stateChanges)
        });
    }

    connectedCallback() {
        this.connected = true;
        
        // If the CurrentPageReference returned before this component was connected,
        // we can use NavigationMixin to generate the URLs
        if (this.generateUrlOnConnected) {
            this.generateUrls();
        }
    }

    handleShowPanelClick(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        // This example passes true to the 'replace' argument on the navigate API
        // to change the page state without pushing a new history entry onto the
        // browser history stack. This prevents the user from having to press back
        // twice to return to the previous page.
        this[NavigationMixin.Navigate](this.showPanelPageReference, true);
    }

    handleNoPanelClick(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this[NavigationMixin.Navigate](this.noPanelPageReference, true);
    }

    connectedCallback() {
        // Store the PageReference in a variable to use in handleClick.
        // This is a plain Javascript object that conforms to the
        // PageReference type by including 'type' and 'attributes' properties.
        // The 'state' property is optional.
        this.accountHomePageRef = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'home'
            }
        };
        this[NavigationMixin.GenerateUrl](this.accountHomePageRef)
            .then(url => this.url = url);
    }

    handleClick(evt) {
        // Stop the event's default behavior.
        // Stop the event from bubbling up in the DOM.
        evt.preventDefault();
        evt.stopPropagation();
        // Navigate to the Account Home page.
        this[NavigationMixin.Navigate](this.accountHomePageRef);
    }
   
    navigateToNewRecordPage(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'new'
            }
        });
    }
    navigateToEditRecordPage(){
        console.log('Record Id ==> '+ this.recordId);
        this[NavigationMixin.Navigate]({
            type:'standard__recordPage',
            attributes:{
                "recordId":this.recordId,
                "objectApiName":"Account",
                "actionName": "edit"
            }
        });
    }
    navigateToViewRecordPage(){
        console.log('Record Id ==> '+ this.recordId);
        this[NavigationMixin.Navigate]({
            type:'standard__recordPage',
            attributes:{
                "recordId":this.recordId,
                "objectApiName":"Account",
                "actionName": "view"
            }
        });
    }


    handleNameChange(event) {
        this.accountId = undefined;
        this.name = event.target.value;
    }
    createAccount() {
        const fields = {};
        fields[FULL_NAME__C_FIELD.fieldApiName] = this.name;
        const recordInput = { apiName: CUSTOMER__C_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then(customer__c => {
                this.accountId = customer__c.id;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account created',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }
}
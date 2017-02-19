import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

import { Customer } from './customer';

import 'rxjs/add/operator/debounceTime'



function emailMatcher(c: AbstractControl) : {[key: string]: boolean} | null {
    let emailControl = c.get('email');
    let confirmControl = c.get('confirmEmail');

    if(emailControl.pristine || confirmControl.pristine)
        return null;

    if(emailControl.value === confirmControl.value)
        return null;
    
    return {'match': true};
}


function ratingRange(min: number, max: number): ValidatorFn {
    return (c: AbstractControl) : {[key: string]: boolean} | null => {
        if(c.value != undefined && (isNaN(c.value) || c.value < min || c.value > max)){
            return {'range': true}
        };
        return null;
    }
}
/*
function ratingRange(c: AbstractControl) : {[key: string]: boolean} | null{
    if(c.value != undefined && (isNaN(c.value) || c.value < 1 || c.value > 5)){
        return {'range': true}
    };
    return null;
}*/

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {
    customerForm: FormGroup;
    customer: Customer= new Customer();
    emailMessage: string;

    private validationMessages = {
        required: 'Please enter your email address.',
        pattern: 'Please enter a valid email address'
    }

    constructor(private fb: FormBuilder){}

    get addresses(): FormArray{
        return <FormArray>this.customerForm.get('addresses');
    }

    ngOnInit(): void{
        /*
        this.customerForm = new FormGroup({
            firstName: new FormControl(),
            lastName: new FormControl(),
            email: new FormControl(),
            sendCatalog: new FormControl(true)
        });*/

        this.customerForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            //lastName: {value:'n/a', disabled: true},
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email:['', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+")]],
                confirmEmail: ['', Validators.required],
            }, {validator: emailMatcher}),            
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(1,5)],
            sendCatalog: true,
            addresses: this.fb.array([this.buildAddress()])         
        });

        this.customerForm.get('notification').valueChanges.subscribe(value => this.setNotification(value));

        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.debounceTime(1000).subscribe(value => this.setMessage(emailControl));
    }

    buildAddress(): FormGroup {
        return this.fb.group({
                addressType: 'home',
                street1: '',
                street2:'',
                city: '',
                state: '',
                zip: ''
            })        
    }

    addAddress():void{
        this.addresses.push(this.buildAddress());
    }

    setMessage(c: AbstractControl): void{
        this.emailMessage = '';
        if((c.touched || c.dirty) && c.errors){
            this.emailMessage = Object.keys(c.errors).map(key => this.validationMessages[key]).join(' ');
        }
    }

    populateTestData():void{

        //requires to set value to every formControl in the form model
       /* this.customerForm.setValue({
            firstName: 'Jose',
            lastName: 'Ben',
            email: 'test@test.com',
            sendCatalog: false
        })*/

        //in this way you set value for some formControls
         this.customerForm.patchValue({
            firstName: 'Jose',
            lastName: 'Ben',            
            sendCatalog: false
        })
    }


    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    setNotification(notifyVia: string):void{
        const phoneControl = this.customerForm.get('phone');

        if(notifyVia === 'text')
            phoneControl.setValidators(Validators.required);
        else
            phoneControl.clearValidators();
        
        phoneControl.updateValueAndValidity();
    }
 }

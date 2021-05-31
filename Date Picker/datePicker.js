import { LightningElement, track } from "lwc";
import { loadStyle } from 'lightning/platformResourceLoader';
import { getConstants } from "c/ahfcConstantUtil";
import ahfctheme from "@salesforce/resourceUrl/AHFC_Theme";

//assign the values returned from the getConstants method from util class
const CONSTANTS = getConstants();
export default class LwcCalendar extends LightningElement {
  currentMonthText;
  currentMonth;
  currentYear;
  value;
  options;
  @track weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  @track dates = [];
  @track rows = [
    { Id: 1, Name: "Row 1", rowList: [] },
    { Id: 2, Name: "Row 2", rowList: [] },
    { Id: 3, Name: "Row 3", rowList: [] },
    { Id: 4, Name: "Row 4", rowList: [] },
    { Id: 5, Name: "Row 5", rowList: [] }
  ];
  @track months = CONSTANTS.MONTHS;
  @track monthsText = CONSTANTS.MONTHSTEXT;
  @track currentSelectedDate ;
  //on page-load
  connectedCallback() {
    loadStyle(this,ahfctheme + '/theme.css').then(()=>{});
    //Note: 0=January, 1=February etc.
    let today = new Date();
    this.currentDate = today.getDate();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.value = today.getFullYear();
    this.options = [{ label: today.getFullYear(), value: today.getFullYear() }];
    //set today's formatted date
    this.currentSelectedDate = this.formatDateForArray(this.currentDate, this.currentMonth, this.currentYear);
    console.log(
      "today-->" +
        today +
        "this.currentMonth-->" +
        this.currentMonth +
        "this.currentYear-->" +
        this.currentYear
    );
    const currMonth = this.monthsText[this.months[this.currentMonth]];
    this.currentMonthText = currMonth.charAt(0).toUpperCase() + currMonth.slice(1).toLowerCase();
    this.showCalendar(this.currentDate, this.currentMonth, this.currentYear);
  }
  //handle previous month selection
  handlePreviousMonth() {
    this.currentYear =
      this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
    this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
    console.log(
      "Handle Previous --> " +
        this.currentMonth +
        "this.currentYear" +
        this.currentYear
    );
    const currMonth = this.monthsText[this.months[this.currentMonth]];
    this.currentMonthText = currMonth.charAt(0).toUpperCase() + currMonth.slice(1).toLowerCase();
    this.value = this.currentYear;
    this.options = [{ label: this.currentYear, value: this.currentYear }];
    this.showCalendar(1, this.currentMonth, this.currentYear);
    this.currentSelectedDate.length > 0 ? this.handleSelectedDate(this.currentSelectedDate) : '';
  }
  //handle next month selection
  handleNextMonth() {
    this.currentYear =
      this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
    this.currentMonth = (this.currentMonth + 1) % 12;
    console.log(
      "Handle Next --> " +
        this.currentMonth +
        "this.currentYear" +
        this.currentYear
    );
    const currMonth = this.monthsText[this.months[this.currentMonth]];
    this.currentMonthText = currMonth.charAt(0).toUpperCase() + currMonth.slice(1).toLowerCase();
    this.value = this.currentYear;
    this.options = [{ label: this.currentYear, value: this.currentYear }];
    this.showCalendar(1, this.currentMonth, this.currentYear);
    this.currentSelectedDate.length > 0 ? this.handleSelectedDate(this.currentSelectedDate) : '';
  }
  //initialise the date-picker everytime a selection is made
  showCalendar(date, month, year) {
    this.dates = [];
    const today = new Date(year, month, date);
    const todayDate = new Date();//today's date

    //get date of 30 days from now
    const future = new Date();//today's date
    future.setDate(future.getDate() + 30);
    console.log('30 days from now === '+future);
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    //console.log('Start Date Of Month --> '+start);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    //console.log('End Date Of Month --> '+end.getDate());
    const firstDayOfMonth = start.getDay();
    const lastDayOfMonth = end.getDay();
    //console.log('First Date Of Month --> '+firstDayOfMonth);
    // Last date of the previous month
    const lastDayOfLastMonth = today.getMonth() === 0 ? 
                              new Date(today.getFullYear()-1, 1, 0).getDate() : 
                              new Date(today.getFullYear() , today.getMonth(), 0).getDate();
    //console.log('Last Date Of Last Month --> '+lastDayOfLastMonth);
    //get day of current date
    let temp = lastDayOfLastMonth - firstDayOfMonth+1;
    console.log("temp-->"+temp);
    //logic for previous values
     for(let prevdates = temp; prevdates<=lastDayOfLastMonth; prevdates++){
       //create date format 
       let dateVar = this.formatDateForArray(temp, month===0?11:month-1, month === 0 ? year-1: year);
       this.dates.push({text:temp, className : 'disabled', key: temp+Math.random(), formatted:dateVar});
       temp++;
    }

    //logic for current values
    for(var index = 1; index<=end.getDate(); index++){
      //get today's formatted date
      const todayFormattedDate = this.formatDateForArray(todayDate.getDate(), todayDate.getMonth(), todayDate.getFullYear());
      let dateVar = this.formatDateForArray(index, month, year);
      let dateInstance = new Date(year, month, index);
      
      if(dateInstance.getTime() > todayDate.getTime() && dateInstance.getTime() <= future.getTime()){
        this.dates.push({text:index, className : CONSTANTS.ENABLED, key:index+Math.random(), formatted:dateVar});
      }else{
        if(dateVar === todayFormattedDate){
          if (this.currentSelectedDate == dateVar) {
            this.dates.push({text:index, className : 'selected-date todays-date', key:index+Math.random(), formatted:dateVar});
            //fire an event to set payoff date variable in Parent comp
            const selectedEvent = new CustomEvent("seldate", {
              detail: {
                selectedDateInChild: this.currentSelectedDate
              }
            });
            // Dispatches the event.b
            this.dispatchEvent(selectedEvent);
          } else {
            this.dates.push({text:index, className : 'todays-date', key:index+Math.random(), formatted:dateVar});
          }
        }else{
          this.dates.push({text:index, className : CONSTANTS.DISABLED, key:index+Math.random(), formatted:dateVar});
        }
        
      }
    }
    //logic for next month values
    var temp2 = 6-lastDayOfMonth;
    for(var index=1; index<=temp2; index++){ 
      let className = '';
      let dateVar = this.formatDateForArray(index, month===11?0:month+1, month===11?year+1:year);
      let dateInstance = new Date(month===11?year+1:year, month===11?0:month+1, index);
      if(dateInstance.getTime() > todayDate.getTime() && dateInstance.getTime() <= future.getTime()){
        this.dates.push({text:index, className : CONSTANTS.ENABLED, key: index+Math.random(), formatted:dateVar});
      }else{
        this.dates.push({text:index, className : CONSTANTS.DISABLED, key: index+Math.random(), formatted:dateVar});
      }
      
    }
    console.log('this.dates-->'+JSON.stringify(this.dates));
  

  }

  weekCount(month, year) {
    const firstOfMonth = new Date(year, month - 1, 1);
    const lastOfMonth = new Date(year, month, 0);
    const numOfWeekse = firstOfMonth.getDay() + 6 + lastOfMonth.getDate();
    return Math.ceil( numOfWeekse / 7);
  }
  //pass the selected date to the parent component
  handleDateClick(event){
    this.currentSelectedDate = event.currentTarget.getAttribute("data-id");
    console.log('onItemSelected:::',this.currentSelectedDate);
    const selectedDate = new Date(this.currentYear, this.currentMonth, event.target.value);
    console.log('selectedDate-->'+selectedDate);
    this.handleSelectedDate(this.currentSelectedDate);
    //fire an event to set payoff date variable in Parent comp
    const selectedEvent = new CustomEvent("seldate", {
      detail: {
        selectedDateInChild: this.currentSelectedDate
      }
    });
    // Dispatches the event.b
    this.dispatchEvent(selectedEvent);
  }
  jumpToToday(){
    //initilaise the calendar again
    this.connectedCallback();
    let today = new Date();
    let todayDate = this.formatDateForArray(today.getDate(), today.getMonth(), today.getFullYear());
    this.currentSelectedDate = todayDate;
    console.log("todayDate--->"+todayDate);
    //fire an event to set payoff date variable in Parent comp
    const selectedEvent = new CustomEvent("seldate", {
      detail: {
        selectedDateInChild: todayDate
      }
    });
    // Dispatches the event.b
    this.dispatchEvent(selectedEvent);
    this.handleSelectedDate(todayDate);
  }

  // logic to format the date in yyyy-mm-dd format
  formatDateForArray(date, month, year) {
    //console.log('month-->'+month+'date-->'+date);
    if (month <= 9 ) 
        month = '0' + (month+1);
    if (date <= 9) 
        date = '0' + (date);

    return [year, month, date].join('-');
  }

  // Logic to apply selected css class to selected date
  handleSelectedDate(selectedDate) {
    const datesArray = this.dates;
    let transformedDate = [];
    datesArray.forEach(item => {
      if (item.formatted === selectedDate) {
        const applyClass = item.className.includes('selected-date') ? '' : 'selected-date';
        transformedDate.push({...item, className: `${applyClass} ${item.className}`});
      } else {
        const applyClass = item.className.replace("selected-date", "");
        transformedDate.push({...item, className: applyClass});
      }
    });
    this.dates = [];
    this.dates = transformedDate;
    console.log('date array: ', JSON.parse(JSON.stringify(this.dates)));
  }

}

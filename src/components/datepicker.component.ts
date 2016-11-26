import { Component, Input, Output, ViewChild, ElementRef, EventEmitter, AfterViewInit, AfterViewChecked } from '@angular/core';

import { DateService } from './datepicker.service';
import { DatePickerDirective } from './datepicker.directive';

@Component({
    templateUrl: 'datepicker.html',
    styleUrls: ['datepicker.css']
})

export class DatePickerComponent implements AfterViewChecked {
    @ViewChild('dayscroll') public dayscroll: ElementRef;
    @ViewChild('yearscroll') public yearscroll: ElementRef;
    public mode: 'calendar' | undefined = 'calendar';
    public type: 'date' | 'string' | 'year' | 'month' | 'calendar' = 'date';
    public today: Date = new Date();
    public selectedDate: Date = new Date();
    public tempDate: Date;
    public dateList: Date[];
    public cols: number[];
    public rows: number[];
    public weekdays: string[];
    public months: string[];
    public date: Date;
    public min: Date;
    public max: Date;
    public callback: EventEmitter<string | Date>;
    public hClasses: any[] = [];
    public dClasses: any[] = [];
    public full: boolean = false;
    constructor(public DatepickerService: DateService) {
        this.date = DatePickerDirective.config.date;
        this.min = DatePickerDirective.config.min;
        this.max = DatePickerDirective.config.max;
        this.callback = <EventEmitter<string | Date>>DatePickerDirective.config.callback;
        this.hClasses = DatePickerDirective.config.headerClasses;
        this.dClasses = DatePickerDirective.config.dateClasses;
        this.full = DatePickerDirective.config.fullScreen;
        if (DatePickerDirective.config.calendar) this.type = 'calendar';
        this.initialize();
    }
    public initialize(): void {
        this.selectedDate = new Date();
        this.tempDate = this.selectedDate;
        this.createDateList(this.selectedDate);
    }

    public getDaysOfWeek(): string[] {
        if (!this.weekdays) {
            this.weekdays = this.DatepickerService.getDaysOfWeek();
        }
        return this.weekdays;
    }
    public ngAfterViewChecked() {
        if (this.dayscroll && this.type === 'date')
            this.dayscroll.nativeElement.scrollTop = this.selectedDate.getDate() * (this.dayscroll.nativeElement.scrollHeight / this.dateList.length);
        else if (this.yearscroll && this.type === 'year')
            this.yearscroll.nativeElement.scrollTop = (this.selectedDate.getFullYear() - 1900) * (this.yearscroll.nativeElement.scrollHeight / this.getYears().length);
    }
    public getMonths(): string[] {
        if (!this.months) {
            this.months = this.DatepickerService.getMonths();
        }
        return this.months;
    }

    public getYears(): Date[] {
        return this.DatepickerService.getYears();
    }

    public createDateList(selectedDate: Date): void {
        this.dateList = this.DatepickerService.createDateList(selectedDate);
        this.cols = new Array(7);
        this.rows = new Array(Math.round(this.dateList.length / this.cols.length) + 1);
    }

    public getDate(row: number, col: number): Date {
        return this.dateList[row * 7 + col];
    }

    public isDefined(date: Date | string): boolean {
        return date !== undefined;
    }

    public isDisabled(date: Date): boolean {
        if (!date) return true;
        if (this.min) {
            this.min.setHours(0, 0, 0, 0);
            if (date < this.min) return true;
        }
        if (this.max) {
            this.max.setHours(0, 0, 0, 0);
            if (date > this.max) return true;
        }
        return false;
    }

    public isActualDate(date: Date): boolean {
        if (!date) return false;
        return date.getDate() === this.today.getDate() &&
            date.getMonth() === this.today.getMonth() &&
            date.getFullYear() === this.today.getFullYear();
    }

    public isActualMonth(month: number): boolean {
        return month === this.today.getMonth();
    }

    public isActualYear(year: number): boolean {
        return year === this.today.getFullYear();
    }

    public isSelectedDate(date: Date): boolean {
        if (!date) return false;
        return date.getDate() === this.selectedDate.getDate() &&
            date.getMonth() === this.selectedDate.getMonth() &&
            date.getFullYear() === this.selectedDate.getFullYear();
    }

    public isSelectedMonth(month: number): boolean {
        return month === this.tempDate.getMonth();
    }

    public isSelectedYear(year: number): boolean {
        return year === this.tempDate.getFullYear();
    }

    public changeType(val: 'date' | 'string' | 'year' | 'month' | 'calendar'): void {
        if (this.type === 'calendar') return;
        this.type = val;
    }

    public showType(val: 'date' | 'string' | 'year' | 'month' | 'calendar'): boolean {
        return this.type === val;
    }

    public selectDate(date: Date): void {
        if (this.isDisabled(date)) return;
        this.selectedDate = date;
        this.selectedDate.setHours(0, 0, 0, 0);
        this.tempDate = this.selectedDate;
    }

    public selectMonth(month: number): void {
        this.tempDate.setMonth(month);
        if (this.tempDate.getMonth() !== month) {
            this.tempDate.setDate(0);
        }
        this.changeType('date');
        this.selectMonthOrYear();
    }

    public selectYear(year: number) {
        this.tempDate.setFullYear(year);
        this.changeType('month');
        this.selectMonthOrYear();
    }

    public getSelectedWeekday(): string {
        if (!this.weekdays) this.getDaysOfWeek();
        return this.weekdays[this.selectedDate.getDay()];
    }

    public getSelectedMonth(): string {
        if (!this.months) this.getMonths();
        return this.months[this.selectedDate.getMonth()];
    }

    public getTempMonth() {
        if (!this.months) this.getMonths();
        return this.months[this.tempDate.getMonth()];
    }
    public getTempYear() {
        return this.tempDate.getFullYear() | this.selectedDate.getFullYear();
    }
    public onCancel(e: Event) {
        this.selectedDate = this.date || new Date();
        this.callback.emit(this.date);
        // this.modal.dismiss();
    };

    public onDone(e: Event) {
        this.date = this.selectedDate;
        this.callback.emit(this.date);
        //  this.modal.dismiss();
    };

    public selectMonthOrYear() {

        this.createDateList(this.tempDate);
        if (this.isDisabled(this.tempDate)) return;
        this.selectedDate = this.tempDate;
    }
    public limitTo(arr: Array<string> | string, limit: number): Array<string> | string {
        if (Array.isArray(arr))
            return arr.splice(0, limit);
        return (<string>arr).slice(0, limit);
    }
    public getMonthRows(): {}[] {
        return [];
    }
    public nextMonth() {
        if (this.tempDate.getMonth() === 11) {
            this.tempDate.setFullYear(this.tempDate.getFullYear() + 1);
            this.tempDate.setMonth(0);
        }
        else {
            this.tempDate.setMonth(this.tempDate.getMonth() + 1);
        }
        this.createDateList(this.tempDate);
    }
    public prevMonth() {
        if (this.tempDate.getMonth() === 0) {
            this.tempDate.setFullYear(this.tempDate.getFullYear() - 1);
            this.tempDate.setMonth(11);
        }
        else {
            this.tempDate.setMonth(this.tempDate.getMonth() - 1);
        }
        this.createDateList(this.tempDate);
    }
}
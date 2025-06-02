function displayNumber(num, ele) {
    setTimeout(() => {
        displayNumberReal(num, ele);
    }, 10);
}

function displayNumberReal(num, ele) {
    let string = num.toString();
    let digits = ele.children;
    let numberEle = ele;
    if (string.length > digits.length) {
        let n = string.length - digits.length;
        for (let i = 0; i < n; i++) {
            let newEle = document.createElement("div");
            newEle.classList.add("digit");
            numberEle.insertBefore(newEle, numberEle.firstChild);
        }
    }
    for (let i = 0; i < digits.length; i++) {
        let si = string.length - 1 - i;
        if (si >= 0) {
            let a = string[si];
            if (a == ".") a = "period";
            if (a == "+") a = "plus";
            if (a == "-") a = "minus";
            digits[digits.length - 1 - i].setAttribute("class", "digit n" + a);
            digits[digits.length - 1 - i].innerHTML = string[si];
        } else {
            digits[digits.length - 1 - i].classList.add("hide");
        }
    }
}

function displayPercent(percent) {
    document.getElementsByClassName("percentage")[0].style.setProperty("--percent", percent * 100 + "%");
    if (percent >= 1) {
        document.getElementsByClassName("percentage")[0].classList.add("full");
    } else {
        document.getElementsByClassName("percentage")[0].classList.remove("full");
    }
    document.getElementsByClassName("percentage")[0].setAttribute("title", Math.floor(percent * 100) + "% complete");
}

let dropdownItemClick = (e) => {
    let onselect = e.currentTarget.getAttribute("onselect");
    if (onselect && typeof window[onselect] == "function") {
        window[onselect]();
        return;
    }
    let content = e.currentTarget.innerHTML;
    let dropdown = e.currentTarget.parentElement.parentElement;
    dropdown.setAttribute("value", e.currentTarget.getAttribute("value"));
    dropdown.children[0].innerHTML = content;
    e.currentTarget.parentElement.hidePopover();
    let name = dropdown.getAttribute("onchange");
    if (name && typeof window[name] == "function") window[name](e.currentTarget.getAttribute("value"));
}

function generateKey() {
    let vals = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let key = "";
    for (let i = 0; i < 30; i++) {
        key += vals[Math.floor(Math.random() * vals.length)];
    }
    return key;
}

let schoolDropdown = [
    {
        "title": "Horizon High School",
        "desc": "Thornton, CO",
        "value": "horizon",
        "icon": '<i class="fa-solid fa-school"></i>'
    },
    {
        "title": "Upload your own",
        "desc": "Upload a config file for your school",
        "value": "upload",
        "icon": '<i class="fa-solid fa-arrow-up-from-bracket"></i>',
        "onselect": "uploadSchoolFile"
    }
]

if (!localStorage.schools) localStorage.schools = "[]";
if (!localStorage.defaultSchool) localStorage.defaultSchool = "horizon";
if (!localStorage.defaultGrade) localStorage.defaultGrade = "Junior";
if (!localStorage.defaultDay) localStorage.defaultDay = "year";
let schools = JSON.parse(localStorage.schools);
for (let i = 0; i < schools.length; i++) {
    schoolDropdown.splice(schoolDropdown.length - 1, 0, {
        "title": schools[i].title,
        "desc": schools[i].desc,
        "value": schools[i].value,
        "icon": '<i class="fa-solid fa-school"></i>',
        "removable": true,
        "onremove": "removeSchool"
    });
}

class Dropdown {
    constructor(info, def, funcName, title) {
        let element = document.createElement("div");
        element.classList.add("custom-dropdown");
        element.setAttribute("value", def);
        element.setAttribute("onchange", funcName ? funcName : "");
        element.setAttribute("data-title", title);
        let id = generateKey();
        element.style.anchorName = "--" + id;
        this.dropdown = element;
        let button = document.createElement("button");
        button.classList.add("dropdown-selected");
        button.setAttribute("tabindex", "0");
        button.setAttribute("popovertarget", id);
        this.selected = button;
        element.appendChild(button);
        let list = document.createElement("div");
        list.classList.add("dropdown-list");
        list.setAttribute("popover", "");
        list.setAttribute("id", id);
        list.style.positionAnchor = "--" + id;
        element.appendChild(list);
        this.list = list;
        this.setOptions(info, def);
        document.getElementsByClassName("dropdowns")[0].appendChild(this.dropdown);
    }

    getValue() {
        return this.dropdown.getAttribute("value");
    }

    select(val) {
        let eles = this.dropdown.children[1].children;
        for (let i = 0; i < eles.length; i++) {
            if (eles[i].getAttribute("value") == val) {
                dropdownItemClick({ "currentTarget": eles[i] });
            }
        }
    }

    getOptions() {
        return this.optlist;
    }

    setOptions(optlist, def) {
        this.optlist = optlist;
        this.dropdown.setAttribute("value", def);
        this.list.innerHTML = "";
        for (let i = 0; i < optlist.length; i++) {
            let ele = document.createElement("div");
            ele.setAttribute("role", "button");
            ele.setAttribute("tabindex", "0");
            ele.setAttribute("onselect", optlist[i].onselect ? optlist[i].onselect : "");
            ele.classList.add("dropdown-item");
            ele.onclick = dropdownItemClick;
            ele.onkeydown = (e) => {
                if (e.key == "Enter" || e.key == " ") {
                    dropdownItemClick(e);
                }
            }
            ele.setAttribute("value", optlist[i].value);
            let content = `<div class='dropdown-icon'>${optlist[i].icon ? optlist[i].icon : ""}</div><div class='dropdown-content'><div class="dropdown-title">${optlist[i].title}</div><div class="dropdown-desc">${optlist[i].desc ? optlist[i].desc : ""}</div></div>${optlist[i].removable ? `<div onclick='event.stopPropagation();${optlist[i].onremove}("${optlist[i].value}")' class='dropdown-remove' tabindex='0' onkeydown='if (event.key == "Enter" || event.key == " ") { event.stopPropagation();${optlist[i].onremove}("${optlist[i].value}") }'><i class="fa-solid fa-xmark"></i></div>` : ''}`
            ele.innerHTML = content;
            if (optlist[i].value == def) {
                this.selected.innerHTML = content;
            }
            this.list.appendChild(ele);
        }
    }

    hide() {
        this.dropdown.style.display = "none";
    }

    show() {
        this.dropdown.style.display = "block";
    }
}

function validateSchoolFile(json) {
    if (!json.id) {
        handleError("School must have an id");
        return false;
    }
    if (!json.name) {
        handleError("School must have a name");
        return false;
    }
    if (json.id == "horizon" || json.id == "upload") {
        handleError("Invalid id");
        return false;
    }
    if (!json.days_off) json.days_off = [];
    if (!json.important_days?.first_day) {
        handleError("School must have a first day");
        return false;
    }
    if (!json.important_days?.last_day) {
        handleError("School must have a last day");
        return false;
    }
    if (new Date(json.important_days.first_day) > new Date(json.important_days.last_day)) {
        handleError("The first day must be before the last day, obviously.");
        return false;
    }
    if (isNaN((new Date(json.important_days.first_day)).getTime())) {
        handleError(`"${json.important_days.first_day}" is not a valid date.`);
        return false;
    }
    if (isNaN((new Date(json.important_days.last_day)).getTime())) {
        handleError(`"${json.important_days.last_day}" is not a valid date.`);
        return false;
    }
    if (!json.enable_defaults) json.enable_defaults = [];
    if (!json.enable_defaults.includes("custom")) json.enable_defaults.push("custom");
    if (!json.grade_overrides) json.grade_overrides = {};
    if (!json.grades || !json.grades.length) {
        handleError("School must include at least one grade");
        return false;
    }
    for (let i = 0; i < json.enable_defaults.length; i++) {
        if (json.enable_defaults[i] == "custom" || json.enable_defaults[i] == "day_off") continue;
        if (!json.important_days[json.enable_defaults[i]]) {
            handleError("Provide the important dates for " + json.enable_defaults[i] + " to include it as a default.");
            return false;
        }
    }
    if (!json.days_in_school) json.days_in_school = ["mon", "tue", "wed", "thu", "fri"];
    if (!json.location || (!json.location.state && !json.location.city)) {
        handleError("Please provide a city and state for the school.");
        return false;
    }
    if (!json.location.state) {
        handleError("Please provide a state for the school.");
        return false;
    }
    if (!json.location.city) {
        handleError("Please provide a city for the school.");
        return false;
    }
    if (!json.time_to_count_down) json.time_to_count_down = 12;
    json.days_off = json.days_off.map((e) => format(new Date(e)));
    json.important_days.first_day = format(new Date(json.important_days.first_day));
    json.important_days.last_day = format(new Date(json.important_days.last_day));
    json.grades.forEach((e) => {
        if (json.grade_overrides[e] && json.grade_overrides[e].add_off) {
            json.grade_overrides[e].add_off = json.grade_overrides[e].add_off.map((e) => format(new Date(e)))
        }
        if (json.grade_overrides[e] && json.grade_overrides[e].remove_off) {
            json.grade_overrides[e].remove_off = json.grade_overrides[e].remove_off.map((e) => format(new Date(e)))
        }
    });
    for (const e of json.enable_defaults) {
        if (e == "custom") continue;
        if (e == "day_off") continue;
        if (json.important_days[e]) {
            json.important_days[e] = json.important_days[e].map((e) => format(new Date(e)));
        }
    }
    return json;
}

function uploadSchoolFile() {
    let tempEle = document.createElement("input");
    tempEle.setAttribute("type", "file");
    tempEle.setAttribute("accept", ".json");
    tempEle.click();
    tempEle.addEventListener('change', function () {
        if (tempEle.files.length > 0) {
            const selectedFile = tempEle.files[0];
            const reader = new FileReader();
            reader.readAsText(selectedFile);
            reader.onload = function (event) {
                const fileContent = event.target.result;
                let json = JSON.parse(fileContent);
                let validation = validateSchoolFile(json);
                if (!validation) {
                    return;
                } else {
                    json = validation;
                }
                let alreadyThere = false;
                schools.forEach((e) => {
                    if (e.value == json.id) {
                        alreadyThere = true;
                        e.title = json.name;
                        e.desc = json.location.city + ", " + json.location.state;
                    }
                })
                if (!alreadyThere) schools.push({ "title": json.name, "desc": json.location.city + ", " + json.location.state, "value": json.id });
                localStorage.schools = JSON.stringify(schools);
                localStorage.setItem("school-" + json.id, JSON.stringify(json));
                if (alreadyThere) schoolDropdown.forEach((e) => {
                    if (e.value == json.id) {
                        e.title = json.name;
                        e.desc = json.location.city + ", " + json.location.state
                    }
                });
                if (!alreadyThere) schoolDropdown.splice(schoolDropdown.length - 1, 0, {
                    "title": json.name,
                    "desc": json.location.city + ", " + json.location.state,
                    "value": json.id,
                    "icon": '<i class="fa-solid fa-school"></i>',
                    "removable": true,
                    "onremove": "removeSchool"
                });
                school.setOptions(schoolDropdown, json.id);
                changeSchool(json.id);
            };
        }
    });
}

let hideError = (e) => {
    document.getElementsByClassName("error")[0].hidePopover();
}

let errorTimeout;

function handleError(err) {
    document.getElementsByClassName("error")[0].showPopover();
    document.getElementsByClassName("error")[0].innerHTML = err.toString();
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(hideError, 3000);
}

class Calendar {
    constructor(month, year, non_highlighted_days, ondayclick) {
        this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let calendarEle = document.createElement("div");
        calendarEle.classList.add("calendar");
        let button1 = document.createElement("button");
        button1.classList.add("calendar-button");
        button1.innerHTML = `<i class="fa-solid fa-caret-left"></i>`;
        button1.onclick = (e) => {
            calendar.prevMonth();
        };
        let title = document.createElement("div");
        title.classList.add("calendar-title");
        let button2 = document.createElement("button");
        button2.classList.add("calendar-button");
        button2.innerHTML = `<i class="fa-solid fa-caret-right"></i>`;
        button2.onclick = (e) => {
            calendar.nextMonth();
        };
        this.title = title;
        calendarEle.appendChild(button1);
        calendarEle.appendChild(title);
        calendarEle.appendChild(button2);
        let descs = ["S", "M", "T", "W", "T", "F", "S"];
        descs.forEach((e) => {
            let ele = document.createElement("div");
            ele.innerHTML = e;
            ele.classList.add("calendar-desc");
            calendarEle.appendChild(ele);
        });
        this.calendar = calendarEle;
        document.getElementsByClassName("settings-box")[0].appendChild(calendarEle);
        this.setMonth(month, year, non_highlighted_days, ondayclick);
    }
    setMonth(month, year, non_highlighted_days, ondayclick) {
        this.month = month;
        this.year = year;
        this.ondayclick = ondayclick;
        this.non_highlighted_days = non_highlighted_days;
        [...this.calendar.children].forEach((e) => {
            if (e.classList.contains("calendar-day")) {
                e.remove();
            }
        });
        this.calendar.children[1].innerHTML = this.months[month] + " " + year;
        let first_day = new Date(this.months[month] + "1, " + year);
        first_day.setDate(first_day.getDate() - first_day.getDay());
        let last_day = structuredClone(first_day);
        last_day.setDate(last_day.getDate() + 7);
        while (last_day.getMonth() == month) {
            last_day.setDate(last_day.getDate() + 7);
        }
        last_day.setDate(last_day.getDate() - 1);
        let days = getDaysArray(first_day, last_day);
        for (let i = 0; i < days.length; i++) {
            let ele = document.createElement("button");
            ele.classList.add("calendar-day");
            ele.onclick = ondayclick;
            ele.setAttribute("data-date", days[i].toString());
            ele.setAttribute("tabindex", "0");
            if (this.emphasizeddate && format(days[i]) == format(this.emphasizeddate)) {
                ele.classList.add("emphasized");
            }
            if (days[i].getMonth() != month) {
                ele.classList.add("faded");
            }
            if (!non_highlighted_days.includes(format(days[i]))) {
                ele.classList.add("no-school");
            }
            ele.innerHTML = days[i].getDate();
            this.calendar.appendChild(ele);
        }
    }
    getDayClick() {
        return this.ondayclick;
    }
    getYear() {
        return this.year;
    }
    getMonth() {
        return this.month;
    }
    setEmphasized(date) {
        date.setHours(0, 0, 0, 0);
        this.emphasizeddate = date;

        [...document.getElementsByClassName("emphasized")].forEach((e) => {
            e.classList.remove("emphasized");
        });
        if (document.querySelector(`[data-date="${date.toString()}"]`)) document.querySelector(`[data-date="${date.toString()}"]`).classList.add("emphasized");
    }
    nextMonth() {
        this.month += 1;
        if (this.month == 12) {
            this.month = 0;
            this.year++;
        }
        this.setMonth(this.month, this.year, this.non_highlighted_days, this.ondayclick);
    }
    prevMonth() {
        this.month -= 1;
        if (this.month == -1) {
            this.month = 11;
            this.year--;
        }
        this.setMonth(this.month, this.year, this.non_highlighted_days, this.ondayclick);
    }
}

let dayclick = (e) => {
    localStorage.customDate = e.currentTarget.getAttribute("data-date");
    let day = new Date(localStorage.customDate);
    calendar.setEmphasized(day);
    let options = days.optlist;
    options.forEach((e) => {
        if (e.value == "custom") {
            e.desc = format(day);
        }
    });
    days.setOptions(options, "custom");
    changeDay("custom");
}

let school = new Dropdown(schoolDropdown, localStorage.defaultSchool, "changeSchool", "School");
let grades = new Dropdown([], "", "changeGrade", "Grade");
let days = new Dropdown([], "", "changeDay", "Countdown Date");
let calendar = new Calendar(0, 0, [], dayclick);
if (localStorage.customDate) {
    calendar.setEmphasized(new Date(localStorage.customDate));
}
let information = {};
changeSchool(localStorage.defaultSchool);

async function changeSchool(value) {
    localStorage.defaultSchool = value;
    information = {};
    if (value == "horizon") {
        const url = "horizon.json";
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            information = json;
        } catch (error) {
            console.error(error.message);
            handleError("Horizon data did not load.");
            return;
        }
    } else {
        information = validateSchoolFile(JSON.parse(localStorage.getItem("school-" + value)));
    }
    if (!information) return;
    let gradeDropdownInfo = [];
    for (let i = 0; i < information.grades.length; i++) {
        gradeDropdownInfo.push({
            "title": information.grades[i],
            "value": information.grades[i]
        });
    }
    grades.setOptions(gradeDropdownInfo, information.grades.includes(localStorage.defaultGrade) ? localStorage.defaultGrade : information.grades[0]);
    changeGrade(information.grades.includes(localStorage.defaultGrade) ? localStorage.defaultGrade : information.grades[0]);
}

function changeGrade(value) {
    localStorage.defaultGrade = value;
    let daysDropdownInfo = [];
    let defaultTexts = {
        "year": "Year",
        "semester": "Semester",
        "trimester": "Trimester",
        "quarter": "Quarter",
        "day_off": "Next Day Off",
        "custom": "Custom",
        "term": "Term"
    }
    for (let i = 0; i < information.enable_defaults.length; i++) {
        let def = information.enable_defaults[i];
        let desc = "Error";
        if (information.important_days && information.important_days[def]) {
            for (let i = 0; i < information.important_days[def].length; i++) {
                let e = information.important_days[def][i];
                let date = (new Date(e));
                date.setHours(23,59,59,999);
                if (date > new Date()) {
                    desc = format(new Date(e));
                    break;
                }
            }
        } else if (def != "day_off" && def != "custom") {
            continue;
        }
        if (def == "day_off") {
            let days_off = applyGradeChanges(information.days_off, value);
            for (let i = 0; i < days_off.length; i++) {
                let e = days_off[i];
                let date = (new Date(e));
                date.setHours(23,59,59,999);
                if (date > new Date()) {
                    desc = format(new Date(e));
                    break;
                }
            }
        }
        if (def == "custom" && !localStorage.customDate) desc = "Select a date on the calendar to count down to";
        if (def == "custom" && localStorage.customDate) desc = format(new Date(localStorage.customDate));
        daysDropdownInfo.push({
            "title": information.texts && information.texts[def] ? information.texts[def] : defaultTexts[def] ?? "Error",
            "value": def,
            "desc": desc
        });
    }
    days.setOptions(daysDropdownInfo, information.enable_defaults.includes(days.getValue()) ? days.getValue() : information.enable_defaults.includes(localStorage.defaultDay) ? localStorage.defaultDay : information.enable_defaults[0]);
    changeDay(information.enable_defaults.includes(days.getValue()) ? days.getValue() : information.enable_defaults.includes(localStorage.defaultDay) ? localStorage.defaultDay : information.enable_defaults[0]);
    let week_days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    let days_off = applyGradeChanges(information.days_off, value);
    let daysInSchool = [];
    for (let i = 0; i < information.days_in_school.length; i++) {
        daysInSchool.push(week_days.indexOf(information.days_in_school[i]));
    }
    let start = new Date((new Date()).setHours(0, 0, 0, 0));
    if (new Date(information.important_days.first_day) >= start) start = new Date(information.important_days.first_day);
    calendar.setMonth(calendar.getYear() ? calendar.getMonth() : start.getMonth(), calendar.getYear() ? calendar.getYear() : start.getFullYear(), getDaysArray(new Date(information.important_days.first_day), new Date(information.important_days.last_day)).filter((e) => daysInSchool.includes(e.getDay()) && !days_off.includes(format(e))).map((e) => format(e)), calendar.getDayClick());
}

function changeDay(value) {
    localStorage.defaultDay = value;
    let countdownUntil;
    let countdownFrom;
    let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    let daysInSchool = [];
    let days_off = applyGradeChanges(information.days_off, grades.getValue());
    if (information.important_days && information.important_days[value]) {
        for (let i = 0; i < information.important_days[value].length; i++) {
            let e = information.important_days[value][i];
            let date = (new Date(e));
            date.setHours(23,59,59,999);
            if (date > new Date()) {
                countdownUntil = new Date(e);
                countdownFrom = information.important_days[value][i - 1] ?? information.important_days.first_day;
                break;
            }
        }
    } else if (value == "day_off") {
        for (let i = 0; i < days_off.length; i++) {
            let e = days_off[i];
            let date = (new Date(e));
            date.setHours(23,59,59,999);
            if (date > new Date()) {
                countdownUntil = new Date(e);
                countdownFrom = information.days_off[i - 1] ?? information.important_days.first_day;
                break;
            }
        }
    } else {
        countdownUntil = new Date(calendar.emphasizeddate);
        if (new Date(information.important_days.last_day) < countdownUntil) {
            countdownUntil = new Date(information.important_days.last_day);
        }
        countdownFrom = information.important_days.first_day;
    }
    for (let i = 0; i < information.days_in_school.length; i++) {
        daysInSchool.push(days.indexOf(information.days_in_school[i]));
    }
    let weekdaysCount = [0, 0, 0, 0, 0, 0, 0];

    let start = (new Date()).setHours(0, 0, 0, 0);
    if (new Date(information.important_days.first_day) >= start) start = new Date(information.important_days.first_day);
    let list = getDaysArray(start, countdownUntil);
    let list1 = getDaysArray(countdownFrom, countdownUntil);
    list = list.filter((e) => daysInSchool.includes(e.getDay()) && !days_off.includes(format(e)))
    list1 = list1.filter((e) => daysInSchool.includes(e.getDay()) && !days_off.includes(format(e)))
    let end_last_day = new Date(information.important_days.last_day);
    end_last_day.setHours(23,59,59,999);
    if ((new Date()).getHours() >= information.time_to_count_down && !days_off.includes(format(new Date())) && daysInSchool.includes((new Date()).getDay()) && new Date() > new Date(information.important_days.first_day) && new Date() < end_last_day) {
        list.splice(0, 1);
    }
    list.forEach((e) => {
        weekdaysCount[e.getDay()]++;
    });
    displayNumber(list.length, document.querySelector(".main-number"));
    displayPercent((list1.length - list.length) / list1.length);
    let weekdayCountdowns = document.querySelectorAll(".weekday-countdown");
    for (let i = 0; i < weekdayCountdowns.length; i++) {
        if (daysInSchool.includes(i)) {
            weekdayCountdowns[i].style.display = "flex";
            weekdayCountdowns[i].removeAttribute("hidden");
        } else {
            weekdayCountdowns[i].style.display = "none";
            weekdayCountdowns[i].setAttribute("hidden", "");
        }
        displayNumber(weekdaysCount[i], weekdayCountdowns[i].children[0]);
    }
}

function applyGradeChanges(days_off, grade) {
    if (!information.grade_overrides) return days_off;
    if (!information.grade_overrides[grade]) return days_off;
    let grade_changes = structuredClone(information.grade_overrides[grade]);
    days_off = days_off.map((e) => new Date(e));
    if (grade_changes.remove_off) grade_changes.remove_off = grade_changes.remove_off.map((e) => (new Date(e)).toUTCString());
    if (grade_changes.add_off) grade_changes.add_off = grade_changes.add_off.map((e) => new Date(e));
    for (let i = 0; i < days_off.length; i++) {
        if (grade_changes.remove_off?.includes(days_off[i].toUTCString())) {
            days_off[i] = null;
        }
    }
    days_off = days_off.filter((e) => e);
    if (grade_changes.add_off) days_off = days_off.concat(grade_changes.add_off);
    days_off.sort((a, b) => a.getTime() - b.getTime());
    days_off = days_off.map((e) => format(e));
    return days_off;
}

function format(date) {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function removeSchool(e) {
    for (let i = 0; i < schools.length; i++) {
        if (schools[i].value == e) {
            schools.splice(i, 1);
            break;
        }
    }
    localStorage.schools = JSON.stringify(schools);
    for (let i = 0; i < schoolDropdown.length; i++) {
        if (schoolDropdown[i].value == e) {
            schoolDropdown.splice(i, 1);
            break;
        }
    }
    let newSchool = school.getValue() != e ? school.getValue() : "horizon";
    school.setOptions(schoolDropdown, newSchool);
    changeSchool(newSchool);
}

function getDaysArray(start, end) {
    for (var arr = [], dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
}
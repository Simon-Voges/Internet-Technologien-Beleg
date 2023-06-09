"use strict";

document.addEventListener("DOMContentLoaded", function () { // event listener der wartet bis DOM content fertig geladen ist befor das script gestartet wird
    let m = new Model();
    let p = new Presenter();
    let v = new View(p);
    p.setModelandView(m, v); // model und view sind eigenschaften der Presenter instanz(bearbeitung)
    p.setTask();
});

//################# Model #################

class Model {
    constructor() { }


    //frage aufrufen
    getTask(nr, selectedCategory) {
        const questions = {
            mathe: [
                "10 + 10",
                "4*4",
                "12+4",
                "5+2"
            ],
            internetTech: [
                "1+1",
                "2+2",
                "3+3",
                "4+4"
            ],
            generellesWissen: [
                "1+2",
                "1+3",
                "1+4",
                "1+5"
            ]

        };

        const categoryQuestion = questions[selectedCategory];
        const randomIndex = Math.floor(Math.random() * categoryQuestion.length); // randomizer which can display same question multiple times 
        return categoryQuestion[randomIndex];
    }

}

//################## Controller ##############

class Presenter {
    constructor() {
        this.anr = 0;
        this.correctAnswerCount = 0;
        this.wrongAnswerCount = 0;
        this.selectedCategory = "";
        this.questionCounter = 0;
        this.categoryName = {
            mathe: "Mathe",
            internetTech: "Internet Technologie",
            generellesWissen: "Generelles Wissen"

        };
        this.correctAnswerByCategory = {
            mathe: 0,
            internetTech: 0,
            generellesWissen: 0,
        };
        this.categoryPlayed = {
            mathe: false,
            internetTech: false,
            generellesWissen: false
        };
    }

    setModelandView(m, v) {
        this.m = m;
        this.v = v;
    }
    startQuiz(selectedCategory) {
        this.selectedCategory = selectedCategory;
        this.setTask(selectedCategory);
        this.categoryPlayed[this.selectedCategory] = true; 
    }

    setTask(selectedCategory) {
        let frag = this.m.getTask(this.anr, selectedCategory);
        View.renderText(frag);

        //generate Random answers 
        let correctAnswer = eval(frag);
        let answers = [];
        for (let i = 0; i < 3; i++) {
            let falseAnswer = correctAnswer - Math.floor(Math.random() * 10) - 1;
            while (falseAnswer === correctAnswer) {
                falseAnswer = correctAnswer - Math.floor(Math.random() * 10) - 1;
                console.log("False Answers: " + falseAnswer);
            }
            answers.push(falseAnswer);
            // answers.push(correctAnswer + Math.floor(Math.random()*10)+1);
        }
        answers.push(correctAnswer);
        console.log("Correct Answer: " + correctAnswer);

        //answers = this.shuffleArray(answers); 

        const shuffledArray = answers.sort((a, b) => 0.5 - Math.random());





        for (let i = 0; i < 4; i++) {
            let pos = i;
            View.inscribeButton(i, shuffledArray[i], pos);
        }

        const correctAnswerIndex = answers.indexOf(correctAnswer);
        console.log("Correct Answer Index: " + correctAnswerIndex);
        this.correctAnswerIndex = correctAnswerIndex;
        return correctAnswerIndex;
    }
    getCorrectAnswerIndex() {
        return this.correctAnswerIndex;
    }

    handleAnswer(selectedIndex) {
        const correctAnswerIndex = this.getCorrectAnswerIndex();
        if (selectedIndex === correctAnswerIndex) {
            this.correctAnswerCount++;
            this.correctAnswerByCategory[this.selectedCategory]++;
            this.v.updateCorrectAnswerCountDisplay(this.correctAnswerByCategory);
            console.log("Correct answer Number: " + this.correctAnswerCount);


        } else {
            this.wrongAnswerCount++;
            console.log("Wrong answer numner: " + this.wrongAnswerCount);
        }
        this.questionCounter++;
        console.log("Questions answered: " + this.questionCounter);
        if (this.questionCounter >= 4) {
            this.questionCounter = 0;
            this.categoryPlayed[this.selectedCategory] = true; 
            this.v.resetCategorySelection();
        } else {
            this.setTask(this.selectedCategory);
        }

    }

}




//############### View ###############

class View {
    constructor(p) {
        this.p = p;
        this.setHandler();

    }

    setHandler() {
        document.getElementById("answer").addEventListener("click", this.checkEvent.bind(this), false);
        document.getElementById("answer").addEventListener("mousedown", this.colorOn.bind(this));
        document.getElementById("answer").addEventListener("mouseup", this.colorOff.bind(this));
        document.getElementById("start").addEventListener("click", this.start.bind(this, false));


    }


    start() {
        const selectedCategory = document.getElementById("category").value; // get selected category
        if(selectedCategory === "") {
            return;  // do nothing if no category is selected 

        }
        else {

        const allOptions=document.querySelectorAll("#category option");
        allOptions.forEach(option => option.removeAttribute("disabled")); 

        document.getElementById("category-selection").style.display = "none"; //hide category selection 
        document.getElementById("start").style.display = "none"; // hide start button
        document.getElementById("quiz-auswahl").style.display = "block"; //show questions



        this.p.startQuiz(selectedCategory);
        }



    }

    resetCategorySelection() {
        document.getElementById("quiz-auswahl").style.display = "none";
        document.getElementById("category-selection").style.display = "block";
        document.getElementById("start").style.display = "block";

        for(const category in this.p.categoryPlayed) {
            const optionElement = document.querySelector(`#category option[value="${category}"]`);
            if (this.p.categoryPlayed[category]) {
                optionElement.setAttribute ("disabled","disabled");
                optionElement.style.display="none"; 
            }
        }

        document.getElementById("category").value =""; 

    }

    static inscribeButton(i, text, pos) {

        const buttons = Array.from(document.querySelectorAll("#answer > *"));
        buttons[i].textContent = text;
        buttons[i].setAttribute("number", pos);

        const answerContainer = document.getElementById("answer");
        answerContainer.innerHTML = "";
        buttons.forEach(button => {
            answerContainer.appendChild(button);
        });

    }

    checkEvent(event) {
        console.log(event.type);
        if (event.target.nodeName === "BUTTON") {
            const selectedIndex = Number(event.target.attributes.getNamedItem("number").value);
            this.p.handleAnswer(selectedIndex);
        }
    }

    colorOn(event) {
        if (event.target.nodeName === "BUTTON") {
            this.color = event.target.style.backgroundColor;
            console.log("ColorOn: " + event.type + "Color: " + this.color);
            const correctAnswerIndex = this.p.getCorrectAnswerIndex();
            console.log("AnswerIndex: " + correctAnswerIndex);
            if (event.target.attributes.getNamedItem("number").value == correctAnswerIndex) {
                event.target.style.backgroundColor = "green"; // richtige antwort
            }
            else event.target.style.backgroundColor = "red";
        }
        
    }

    colorOff(event) {
        console.log("ColorOff: " + event.type + "Color: " + this.color);
        event.target.style.backgroundColor = this.color;
    }


    static renderText(text) {
        let div = document.getElementById("boo");
        div.innerHTML = ""; //clears the content of the div for each new question
        let p = document.createElement("p");
        p.innerHTML = text;
        div.appendChild(p);
    }

    updateCorrectAnswerCountDisplay(correctAnswerByCategory) {
        const displayAnswerCount = document.getElementById("correct-answer-count-display");
        displayAnswerCount.innerHTML = "";
    
        for (const category in correctAnswerByCategory) {
            const categoryCount = correctAnswerByCategory[category];
            const displayAnswerCountElement = document.createElement("p");
            displayAnswerCountElement.textContent = `${this.p.categoryName[category]}: ${categoryCount} correct answers`;
            displayAnswerCount.appendChild(displayAnswerCountElement);
        }
    }
}
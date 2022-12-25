// This is an old project of mine, resurrected from the dead :)
// I made this back in 2014, as I was learning about postfix
// notation at the university. 

// This calculator uses postfix notation (AKA Reverse Polish
// Notation) to compute the result of the given mathematical 
// expression in the correct order of operations.
// 
// I kept the code as it is, so I apologize if it looks a bit outdated... :)
// To read more about postfix notation, see https://en.wikipedia.org/wiki/Reverse_Polish_notation

window.onload = function() {
    new Calculator();
};

/**
 * Calculator class
 */
function Calculator() {
    this.op_add       = '+';
    this.op_substract = '-';
    this.op_multiply  = '*';
    this.op_divide    = '/';
    this.op_pow       = '^';
    

    this.num_1   = 1;
    this.num_2   = 2;
    this.num_3   = 3;
    this.num_4   = 4;
    this.num_5   = 5;
    this.num_6   = 6;
    this.num_7   = 7;
    this.num_8   = 8;
    this.num_9   = 9;
    this.num_0   = 0;
    this.num_dot = '.';
    
    this.screen = new Screen(this);
    this.keys = new Keyboard(this);
}

Calculator.prototype.infixToPostfix = function( infix ) {
    var length = infix.length;
    var stack = new Array(); // Holds operators
    var postfix = ""; // The result expression
    var chars = infix.split('');

    // Each character
    for ( var i = 0; i < length; i++ ) {
        var curChar = chars[i],
            nextChar = '';

        // Get the next char (unless it's the last char)
        if(i < length-1) {
            nextChar = chars[i+1];
        }

        // Operators
        if(!this.isInt(chars[i]) && chars[i] !== ".") {
            
            while ( stack.length > 0 ) {
                if (this.comparePrecedence(stack.peek(), curChar)) {
                    postfix += stack.pop() + " ";
                }
                else {
                    break;
                }
            }
            stack.push(curChar);
        }

        // Operands
        else {
            if(this.isInt(nextChar) || nextChar === '.')
                postfix += curChar;
            else postfix += curChar + " ";
        }
    }

    // Pop the remaining operators
    while (stack.length > 0) {
        postfix += stack.pop() + " ";
    }

    return postfix.trim();
};

Calculator.prototype.postfixEval = function( postfix ) {
    var resultStack = new Array();
    var postfix = postfix.split(" ");
    var length = postfix.length;
    var decimal;
    var curElement;

    // Each element
    for ( var i = 0; i < length; i++ ) {
        curElement = postfix[i];

        // Operand
        if( this.isFloat(curElement) ) {
            var decimal = parseFloat(curElement);
            resultStack.push(decimal);
        }

        // Operator
        else {
            var result = this.applyOperator(resultStack.pop(), resultStack.pop(), curElement);
            resultStack.push(result);
        }	
    }
    return resultStack.pop();
};

Calculator.prototype.comparePrecedence = function( op_a, op_b ) {
    var precedence = ['+','-','*','/','^','(',')'];
    return precedence.indexOf(op_a) > precedence.indexOf(op_b);
};

Calculator.prototype.applyOperator = function(b, a, operator) {
    switch( operator ) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return a / b;
        case "^":
            return Math.pow(a, b);
    }
}

Calculator.prototype.isInt = function( num ) {
    return !isNaN(parseInt(num));
};

Calculator.prototype.isFloat = function( num ) {
    return !isNaN(parseFloat(num));
};

/**
 * Screen class
 */
function Screen( calculator ) {
    this.calculator = calculator;
    this.expressionHolder = document.getElementById('expression');
    this.expression = '';
    this.result = document.getElementById('result');
    this.cursor = new Cursor(this);
}

Screen.prototype.appendToExpression = function( token ) {
    var value = this.calculator[token];
    this.expressionHolder.innerHTML += value;
    this.expressionHolder.scrollLeft = this.expressionHolder.scrollWidth;
    this.expression += value;
    this.cursor.moveToEnd();
};

Screen.prototype.setResult = function( number ) {
    this.result.innerHTML = number.toString().slice(0,11);
    this.expression = number.toString();
    this.expressionHolder.innerHTML = number;
    this.cursor.moveToEnd();
};

Screen.prototype.clear = function() {
    this.result.innerHTML = 0;
    this.expressionHolder.innerHTML = '';
    this.expression = '';
    this.cursor.moveToStart();
};

Screen.prototype.cancelEntry = function() {
    this.expressionHolder.innerHTML = '';
    this.expression = '';
    this.cursor.moveToStart();
};

/**
 * Cursor class
 */
function Cursor( screen ) {
    this.screen = screen;
    this.pos = 0;
}

Cursor.prototype.moveTo = function( pos ) {
    if( pos >= 0 && pos <= this.screen.expression.length) {
        // Remove current cursor
        try {
            document.getElementById('expression').removeChild(document.getElementById('typed-cursor'));
        }
        catch(e) {

        }
      
        // Recreate it
        var cursor = '<span id="typed-cursor"></span>';
        var expression = this.screen.expression;
        expression = expression.substring(0,pos) + cursor + expression.substring(pos, expression.length);
        this.pos = pos;
        document.getElementById('expression').innerHTML = expression;
    }
};

Cursor.prototype.moveToEnd = function() {
    this.moveTo(this.screen.expression.length);
};

Cursor.prototype.moveToStart = function() {
    this.moveTo(0);
};


/**
 * Keyboard class
 */
function Keyboard( calculator ) {
    this.calculator = calculator;
    this.keys = document.querySelectorAll('.key');
    for( var i = 0; i < this.keys.length; i++ ) {
        var self = this;
        this.keys[i].onclick = function() {
            self.keyPress(this);
        };
    }
}

Keyboard.prototype.keyPress = function( key ) {
    if( key.getAttribute("data-func") === null) {
        this.calculator.screen.appendToExpression( key.getAttribute("data-token") );
    }
    else {
        this['key_' + key.getAttribute("data-func")]();
    }
};

// Calculator key actions

Keyboard.prototype.key_eval = function() {
    var postfix = this.calculator.infixToPostfix(this.calculator.screen.expression);
    this.calculator.screen.setResult(this.calculator.postfixEval(postfix));
};

Keyboard.prototype.key_clear = function() {
    this.calculator.screen.clear();
};

Keyboard.prototype.key_cancel_entry = function() {
    this.calculator.screen.cancelEntry();
};

Array.prototype.peek = function() {
    return this[this.length-1];
};
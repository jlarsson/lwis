{
    var expressions = require('./expressions');
	function integer(v){
        return expressions.LiteralExpression(parseInt(v.join(''), 10));
	}
	function string(v){
        return expressions.LiteralExpression(parseInt(v.join('')));
	}
	function field(v){
        return expressions.FieldExpression(parseInt(v.join('')));
	}
	function param(v){
        return expressions.ParamExpression(parseInt(v.join('')));
		return {t:'param',v: v.join('')};
	}
	function unary(op, expr){
        return expressions.UnaryOperatorExpression(op, expr);
	}
	function binary(op, lhs, rhs){
        return expressions.BinaryOperatorExpression(op, lhs, rhs);
	}
}

Start = __ when:WhenExpression __ { return {when: when}; }

Integer "integer"
	= digits:[0-9]+ { return integer(digits); }

String "string"
	= "'" chars:[a-zA-Z0-9]* "'" { return string(chars); }

Field "field"	
	= "{" chars:[a-zA-Z0-9\.\[\]]* "}" { return field(chars); }
	
Param "param"	
	= ":" chars:[a-zA-Z0-9]* { return param(chars); }
	
__ "whitespace" = [ \t\n\r]* { return null; }

WhenExpression = "when" __ expression:Expression { return expression; }

Expression = LogicalORExpression

PrimaryExpression
	= Integer
	/ String
	/ Field
	/ Param
	/ "(" __ expression:Expression __ ")" { return expression; }

UnaryExpression
	= operator:UnaryOperator expression:PrimaryExpression { return unary(operator,expression); }
	/ PrimaryExpression
	
UnaryOperator
	= $("+" !"=")
	/ $("-" !"=")
	/ "~"
	/ "!"
	
MultiplicativeExpression
	= left:UnaryExpression __ operator:MultiplicativeOperator __ right:MultiplicativeExpression { return binary(operator,left,right); }
	/ UnaryExpression

MultiplicativeOperator
  = $("*" !"=")
  / $("/" !"=")
  / $("%" !"=")	
  
AdditiveExpression
	= left:MultiplicativeExpression __ operator:AdditiveOperator __ right:AdditiveExpression { return binary(operator,left,right); }
	/ MultiplicativeExpression
	
AdditiveOperator
  = $("+" ![+=])
  / $("-" ![-=])
  
ShiftExpression
	= left:AdditiveExpression __ operator:ShiftOperator __ right:ShiftExpression { return binary(operator,left,right); }
	/ AdditiveExpression

ShiftOperator
  = $("<<"  !"=")
  / $(">>>" !"=")
  / $(">>"  !"=")
	
RelationalExpression
	= left:ShiftExpression __ operator:RelationalOperator __ right:RelationalExpression { return binary(operator,left,right); }
	/ ShiftExpression
	
RelationalOperator
  = "<="
  / ">="
  / $("<" !"<")
  / $(">" !">")

EqualityExpression
	= left:RelationalExpression __ operator:EqualityOperator __ right:EqualityExpression { return binary(operator,left,right); }
	/ RelationalExpression

EqualityOperator
  = "==="
  / "!=="
  / "=="
  / "!="
  
BitwiseANDExpression
	= left:EqualityExpression __ operator:BitwiseANDOperator __ right:BitwiseANDExpression { return binary(operator,left,right); }
	/ EqualityExpression
	
BitwiseANDOperator
  = $("&" ![&=])	
  
BitwiseXORExpression
	= left:BitwiseANDExpression __ operator:BitwiseXOROperator __ right:BitwiseXORExpression { return binary(operator,left,right); }
	/ BitwiseANDExpression
	
BitwiseXOROperator
  = $("^" !"=")
  
BitwiseORExpression
	= left:BitwiseXORExpression __ operator:BitwiseOROperator __ right:BitwiseORExpression { return binary(operator,left,right); }
	/ BitwiseXORExpression

BitwiseOROperator
  = $("|" ![|=])
  
LogicalANDExpression
	= left:BitwiseORExpression __ operator:LogicalANDOperator __ right:LogicalANDExpression { return binary(operator,left,right); }
	/ BitwiseORExpression

LogicalANDOperator
  = "&&"
  
LogicalORExpression
	= left:LogicalANDExpression __ operator:LogicalOROperator __ right:LogicalORExpression { return binary(operator,left,right); }
	/ LogicalANDExpression

LogicalOROperator
  = "||"	
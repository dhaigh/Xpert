( function () {

var tree = $( "#tree" ).html().trim().split( "\n" );

function callback ( tree ) {

	var questionInfo = xpert.getQuestionInfo( tree ),
	questionHTML = "";

	$( "#questions-container h2" ).html( questionInfo.question );

	$.each( questionInfo.responses, function (i, curr) {
		questionHTML += '<a href="#" data-rindex="' + i + '">' + curr + '</a>';
	});

	$( "#questions" ).html( questionHTML );

	$( "#questions a" ).click( function () {

		var responseIndex = this.getAttribute( "data-rindex" ),
			next          = questionInfo.subTree[ responseIndex ][ 1 ];

		// more questions coming
		if ( $.type(next) === "array" ) {
			callback( next );

		// answer found
		} else {
			$( "#questions-container h2" ).html( "It's " + next + "!" );
			$( "#questions" ).html( "" );
			$( "#restart" ).show();
		}

		return false;

	});

}

tree = xpert( tree );
callback( tree );

$( "#restart" ).click( function () {
	callback( tree );
	$( this ).hide();
});

}() );
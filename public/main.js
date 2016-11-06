var socket = io.connect();

$(document).ready(function(){
    Chart.defaults.global = {
        animation: true,
        anitmationSteps: 60,
        animationEasing: "linear",
        showScale: true,
        scaleOverride: false,
        scaleLineColor:"rgba(0,0,0,.1)",
        scaleLineWidth: 1,
        scaleShowLabels: true,
        scaleLabel: "<%=value%>",
        scaleIntegersOnly: true,
        scaleBeginAtZero: false,
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        responsive: false,
        maintainAspectRatio: true,
        showTooltips: true,
        customTooltips: false,
        tooltipEvents: ["mousemove", "touchstart", "touchmove"],
        tooltipFillColor: "rgba(0,0,0,0.8)",
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipFontSize: 14,
        tooltipFontStyle: "normal",
        tooltipFontColor: "#fff",
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipTitleFontSize: 14,
        tooltipTitleFontStyle: "bold",
        tooltipTitleFontColor: "#fff",
        tooltipYPadding: 6,
        tooltipXPadding: 6,
        tooltipCaretSize: 8,
        tooltipCornerRadius: 6,
        tooltipXOffset: 10,
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
        multiTooltipTemplate: "<%= value %>",
        onAnimationProgress: function(){},
        onAnimationComplete: function(){}
        };
    var data = [
        {
            value: 300,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Red"
        },
        {
            value: 50,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "Green"
        },
        {
            value: 100,
            color: "#FDB45C",
            highlight: "#FFC870",
            label: "Yellow"
        }
    ];
    var options = {
        segmentShowStroke : true,
        segmentStrokeColor : "#fff",
        segmentStrokeWidth : 2,
        percentageInnerCutout : 25, // This is 0 for Pie charts
        animationSteps : 15,
        animationEasing : "linear",
        animateRotate : true,
        animateScale : false,
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
    };
    var channels = ['#reynad27','#forsenlol','#nl_kripp','#nightblue3','#sodapoppin','#summit1g', '#c9sneaky', '#tidesoftime', '#trick2g', '#lirik', '#imaqtpie', '#mushisgosu'];
    var colors = ["#FF9900", "#B30077","#E6FF00", "#E8FF1A", "#00FF1A", "#4DFF5E","#0066FF", "#1A75FF", "#1A00FF", "#301AFF", "#B13DFF", "#BC57FF", "#FF1A00", "#FF4733","#FF14B1", "#FF2EB9"];
    
    var ctx = document.getElementById("infoChart").getContext("2d");
    var myNewChart = new Chart(ctx).Doughnut(data, options);
    
    
    socket.on('newCurrentInfo', function(channelsIn){
        if(channelsIn.length < 1){
            document.getElementById("current_watchers").innerHTML = "none";
        }else{
            document.getElementById("current_watchers").innerHTML = channelsIn;
            /*
            var channelsSplit = channelsIn.split(', ');
            
            console.log('SPLIT LENGTH:' + channelsSplit.length);
            var replace = "";
            
            for(var i=0; i<channelsSplit.length; i++){
                replace += "<div href=\"https://twitch.tv/" + channelsSplit[i] + "\">" + channelsSplit[i] + "   </div>";
            }
            
            document.getElementById("current_watchers").innerHTML = replace;
            */
        }
    });
    
    
    document.getElementById("request_button").addEventListener('click', function(){
        socket.emit('request_markov'); 
    });
    
    socket.on('recieve_markov', function(markovText){
        alert(markovText);
    });
    /*
    socket.on('togetherData', function(dataArray){
        for(var i=0; i<dataArray.length; i++){
           myNewChart.addData({
               value: dataArray[i],
               color: colors[2*i],
               highlight: colors[2*i + 1],
               label: channels[i]
            });
        }
        console.log(data);
    });
    */
    socket.on('togetherData', function(dataArray){
        console.log("1 " + myNewChart.segments.length);
        while(myNewChart.segments.length > 0){
            myNewChart.removeData();
        }
        console.log("2 " + myNewChart.segments.length);
        for(var i=0; i<dataArray.length-1; i++){
            if(dataArray[i]!=0){
                myNewChart.addData({
                   value: dataArray[i],
                   color: colors[2*i],
                   highlight: colors[2*i + 1],
                   label: channels[i]
                });
            }
        }
        console.log("3 " + myNewChart.segments.length);
    });
    
});
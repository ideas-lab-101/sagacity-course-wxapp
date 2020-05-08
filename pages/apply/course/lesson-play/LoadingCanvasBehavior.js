module.exports = Behavior({
    data: {
        
    },
    methods: {
        
        __initLoadingCanvas: function () {
            const self = this;
            let steps = 1;
            let startAngle = 1.5 * Math.PI;
            let endAngle = 0;
            let speed = 100;
            let sec = 100;

            function drawLoading (){
                if(steps < 101){
                    endAngle = steps * 2 * Math.PI / speed + startAngle;
                    self.__drawing(startAngle, endAngle);
                    steps++;
                    console.log(steps);
                }else{
                    clearInterval(this.interval);
                }
            }

            this.interval = setInterval(drawLoading, sec);

        },
        
        __drawing: function (s, e) {
            const context = wx.createCanvasContext('loadingCanvas');
            context.setLineWidth(4);
            context.setStrokeStyle('#11be0f');
            context.setLineCap('round');
            context.beginPath();
            context.arc(100, 100, 96, s, e, false);
            context.stroke();
            context.draw();
        }
    }
})
/* 
**
** Simon Game - v1.0 
** Author - Purushoth<purush0th.github.io>
**
*/

(function () {
    'use strict';

    angular.module('app', []);
})();


////

(function () {
    'use strict';

    angular.module('app').constant('Sounds', {
        'simon-1': 'assets/audio/simonSound1.mp3',
        'simon-2': 'assets/audio/simonSound2.mp3',
        'simon-3': 'assets/audio/simonSound3.mp3',
        'simon-4': 'assets/audio/simonSound4.mp3',
        'error': 'assets/audio/error-beep.mp3'
    });
})();
////

(function () {
    'use strict';

    angular
        .module('app')
        .controller('AppController', AppController);

    AppController.$inject = ['Sounds', '$interval', '$timeout'];
    function AppController(Sounds, $interval, $timeout) {

        var vm = this;
        var pattern = [];
        var gameHandler;
        var playIntervalHandler;
        var playerTurn = 0;
        var iteration = 0;

        vm.clickable = false;
        vm.currentPattern = '';
        vm.display = '--';
        vm.strictMode = false;
        vm.power = false;
        vm.pressPad = pressPad;
        vm.releasePad = releasePad;
        vm.start = start;
        vm.toggleStrictMode = toggleStrictMode;
        vm.togglePower = togglePower;


        activate();

        ////////////////

        function activate() { }

        function showError() {
            updateDisplay('!!');

            audioControl('error');

            gameHandler = $timeout(function () {
                if (vm.strictMode) {
                    iteration = 0;
                    patternGenerator();
                    playPattern();
                }
                else
                    playPattern();

            }, 2000);
        }

        function disableClick() {
            vm.clickable = false;
            $timeout(function () {
                vm.currentPattern = '';
            }, 200);
        }

        function showComplete() {
            updateDisplay('**');

            $timeout(function () {
                vm.currentPattern = 'simon-' + 1;
                audioControl(vm.currentPattern);

                $timeout(function () {
                    vm.currentPattern = 'simon-' + 2;
                    audioControl(vm.currentPattern);

                    $timeout(function () {
                        vm.currentPattern = 'simon-' + 4;
                        audioControl(vm.currentPattern);

                        $timeout(function () {
                            vm.currentPattern = 'simon-' + 3;
                            audioControl(vm.currentPattern);
                            disableClick();
                        }, 500);

                    }, 500);

                }, 500);

            }, 500);

        }

        function updateDisplay(message) {
            vm.display = message || (iteration < 10 ? '0' + iteration : iteration);
        }

        function pressPad(button) {
            $timeout.cancel(gameHandler);

            vm.currentPattern = 'simon-' + button;

            if (pattern[playerTurn] === vm.currentPattern) {
                audioControl(vm.currentPattern);
                playerTurn++;

                if (pattern.length === playerTurn) {
                    playerTurn = 0;
                    disableClick();

                    if (iteration === 20) {
                        // yeah...! you are a winner....!!
                        gameHandler = $timeout(showComplete, 500);

                    } else {
                        //continue to the next pattern
                        patternGenerator();
                        gameHandler = $timeout(playPattern, 1500);
                    }
                }
            }
            else {
                playerTurn = 0;
                showError();
            }
        }



        function releasePad() {
            vm.currentPattern = '';
        }

        function patternGenerator() {
            iteration++;
            pattern = [];

            for (var i = 0; i < iteration; i++) {
                var random = randomNumber();
                pattern.push('simon-' + random);
            }
        }

        function audioControl(audioItem) {
            var audioSrc = Sounds[audioItem];
            if (!audioSrc)
                return;

            var audio = new Audio(audioSrc);
            audio.play();

        }

        function playPattern() {
            updateDisplay();

            vm.clickable = false;
            var playSpeed = getSpeed();
            var item = 0;

            playIntervalHandler = $interval(playHandler, playSpeed);

            function playHandler() {
                var audioItem = pattern[item];

                audioControl(audioItem);

                vm.currentPattern = audioItem;

                gameHandler = $timeout(function () {
                    vm.currentPattern = '';
                }, playSpeed / 2 - 10);

                item++;

                if (item === pattern.length) {
                    $interval.cancel(playIntervalHandler);
                    vm.clickable = true;
                    gameHandler = $timeout(showError, 5 * playSpeed);
                }
            }


        }

        function start() {
            if (!vm.power)
                return;

            iteration = 0;

            patternGenerator();

            gameHandler = $timeout(playPattern(), 500);

        }

        function getSpeed() {

            var speedLevels = [1250, 1000, 750, 500];

            if (iteration < 4) {
                return speedLevels[0];
            } else if (iteration < 8) {
                return speedLevels[1];
            } else if (iteration < 12) {
                return speedLevels[2];
            } else {
                return speedLevels[3];
            }

        }

        function reset() {
            vm.strictMode = false;
            iteration = 0;
            vm.clickable = false;
            playerTurn = 0;
            vm.display = '--';
            vm.currentPattern = '';

            $timeout.cancel(gameHandler);
            $interval.cancel(playIntervalHandler);
        }

        function togglePower() {

            // powering off
            if (vm.power) {
                reset();
            }

            vm.power = !vm.power;
        }

        function toggleStrictMode() {
            if (!vm.power)
                return;

            vm.strictMode = !vm.strictMode;
        }

        function randomNumber() {
            return Math.floor(Math.random() * 4) + 1;
        }
    }
})();
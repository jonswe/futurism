angular.module('futurism')
	.directive('attackAnim', function($, $rootScope, maths, animFns) {
		'use strict';


		return {
			restrict: 'A',
			link: function(scope, boardElement) {


				scope.$on('event:attk', function(srcScope, update) {

					var targets = update.data;

					var attacker = animFns.makeAnimTarget(update, targets[0]);
					var defender = animFns.makeAnimTarget(update, targets[1]);

					animAttack(attacker, defender, function() {
						console.log('defender', defender);
						if( (!defender.newData || defender.newData.health > 0) && defender.target.card.attack > 0) {
							animAttack(defender, attacker, function() {
								done();
							});
						}
						else {
							done();
						}
					});
				});


				var animAttack = function(attacker, defender, callback) {
					var srcPoint = animFns.targetCenter(attacker.target, boardElement);
					var destPoint = animFns.targetCenter(defender.target, boardElement);

					var angleRad = Math.atan2(destPoint.y - srcPoint.y, destPoint.x - srcPoint.x);
					var angleDeg = (angleRad * maths.RAD_DEG) + 90;

					defender.newData = defender.newData || {health: defender.target.card.health};
					var damage = defender.target.card.health - defender.newData.health;

					if(damage === 0) {
						damage = 'miss!';
					}
					else {
						damage = "-" + damage;
					}

					boardElement.append($('<div class="attack-effect"><div class="sword"></div></div>')
						.css({left: srcPoint.x-10, top: srcPoint.y-75, opacity: 0, transform: 'rotate('+angleDeg+'deg)'})
						.animate({opacity: 1}, 1000)
						.animate({left: destPoint.x-10, top: destPoint.y-75}, 400, 'linear', function() {

							boardElement.append($('<div class="life-effect life-effect-dec">'+damage+'</div>')
								.css({left: destPoint.x, top: destPoint.y})
								.animate({top: destPoint.y-100}, 'slow')
								.animate({opacity: 0}, 'slow', function() {
									this.remove();
								}));

						})
						.animate({opacity: 0}, 500, function() {
							this.remove();
							callback();
						}));
				};


				var done = function() {
					$rootScope.$apply(function() {
						$rootScope.$broadcast('event:animationComplete');
					});
				};



			}
		};
	});
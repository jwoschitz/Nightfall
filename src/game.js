define(["engine/core", "game/sound"], function(engine, snd) {
	var PP = engine.propulsion;

	var spr=PP.spr,rm=PP.rm,Alarm=PP.Alarm,collision=PP.collision,draw=PP.draw,init=PP.init,key=PP.key,loop=PP.loop,mouse=PP.mouse,Sprite=PP.Sprite;
	
	var global = {},
		obj = {};
	
	var Rotation = function(radians){
		this.radians = radians || 0;
		this.get = function() {
			return this.radians;
		};
		this.toDegrees = function(){
			return Math.radToDeg(this.radians);
		};
		this.rotateToMousePos = function(currentX, currentY){
			this.radians = Math.pointDirection(currentX,currentY,mouse.x,mouse.y);
		};
		this.rotateToObj = function(currentX, currentY, obj){
			this.radians = Math.pointDirection(currentX,currentY,obj.x,obj.y);
		};
		return this;
	};
  
	var move = {
		direction: function(obj,angle,length, precise) {
			obj.x += Math.cos(angle)*length;
			obj.y += Math.sin(angle)*length;
			
			return obj;
		}
	};
	
	init('game',640,480);
	loop.rate = 30;
	
	//SPRITES
	spr.zombie = {};	 
	spr.zombie.red = new Sprite('sprites/zombie.png',1,24,34);
	spr.zombie.blue = new Sprite('sprites/zombie.png',1,24,34);
	spr.zombie.green = new Sprite('sprites/zombie.png',1,24,34);
	spr.player = {};
	spr.player.pistol = new Sprite('sprites/player.png',1,24,20);
	spr.player.mp5 = new Sprite('sprites/player_mp5.png',1,27,23);
	spr.muzzleflash = new Sprite('sprites/muzzleflash.png',1,24,23);
	spr.bullet = {};
	//spr.bullet.cal9mm = new Sprite('sprites/tracer.png',1,0,0);
	spr.tilemap = {};
	spr.tilemap.grass = new Sprite('sprites/tilemap/G000M800.png',1,0,0);
	spr.tilemap.grass1 = new Sprite('sprites/tilemap/G000M801.png',1,0,0);
	spr.tilemap.grass2 = new Sprite('sprites/tilemap/G000M802.png',1,0,0);
	
	spr.menubg = new Sprite('sprites/menu.png',1,0,0);
	
	var onGameLoaded = function() {
		obj.world = {
			isDebug: false,
			defaults: {
				isDay: true,
				isSunset: false,
				isSunrise: false,
				day: 0,
				dayTimeInMinutes: 1000,
				sunriseStart: 480,
				sunriseEnd: 0,
				sunriseDuration: 150,
				sunsetStart: 1080,
				sunsetEnd: 0,
				sunsetDuration: 150,
				endOfDay: 1440,
				timeFactor: 1,
				ticksUntilNextStep: 0,
				interval: 1,
				isPaused: false,
				resetWorldOriginOnNextStep: false,
				gameObjects: {				
					zombies: [],
					bullets: []
				},
				origin:{
					x: 0,
					y: 0
				}
			},
			gameObjects: {				
				zombies: [],
				bullets: []
			},
			playerPos: {
				x: undefined,
				y: undefined
			},
			dimension: {
				P1: {
					x: 0,
					y: 0
				},
				P2: {
					x: 2000,
					y: 2000
				}
			},
			contains: function(obj){
					if(obj.x < this.dimension.P1.x || obj.x > this.dimension.P2.x || obj.y < this.dimension.P1.y  || obj.y > this.dimension.P2.y) return false;	
					return true;
			},	
			view: {
				top: 0,
				bottom: PP.view.height,
				left: 0,
				right: PP.view.width,
				contains: function(obj){
					if(obj.x < (this.left) || obj.x > (this.right) || obj.y < (this.top) || obj.y > (this.bottom)) return false;	
					return true;
				}
			},	
			initialize: function(t){
				Object.extend(this, this.defaults);
				t.ticksUntilNextStep = t.interval;
				t.sunriseStart = t.sunriseStart * t.timeFactor;
				t.sunriseDuration = t.sunriseDuration * t.timeFactor;
				t.sunriseEnd = t.sunriseStart + t.sunriseDuration;
				t.sunsetStart = t.sunsetStart * t.timeFactor;
				t.sunsetDuration = t.sunsetDuration * t.timeFactor;
				t.sunsetEnd = t.sunsetStart + t.sunsetDuration;
				t.endOfDay = t.endOfDay * t.timeFactor;
			},
			tick: function(t){
				if(t.resetWorldOriginOnNextStep){
					t.origin.x = 0;
					t.origin.y = 0;
					t.resetWorldOriginOnNextStep = false;
				}	
				if(t.origin.x != 0 || t.origin.y != 0){
					t.resetWorldOriginOnNextStep = true;
				}				
				t.ticksUntilNextStep -= 1;
				if(t.ticksUntilNextStep <= 0){
					t.ticksUntilNextStep = t.interval;
					t.dayTimeInMinutes++;
				}	
				if(t.dayTimeInMinutes >= t.sunriseStart && t.dayTimeInMinutes < t.sunriseEnd && !t.isDay && !t.isSunrise){
					t.isSunrise = true;
				}
				else if(t.dayTimeInMinutes >= t.sunsetStart && t.isDay && !t.isSunset){
					t.isSunset = true;
					//snd.manager.play('sunset');
				}
				if(t.dayTimeInMinutes >= t.endOfDay){
					t.dayTimeInMinutes = 0;
					t.day++;
				}
				if(key.p.down && !this.isPaused){
					this.isPaused = true;
					this.pause();	
					return;
				}
				if(this.isPaused){
					this.isPaused = false;
				}
			},
			pause: function(){		
				document.onkeydown = function(event) {
					if(event.keyCode == 80){
						PP.obj.world.unpause();										
					}
				};
				loop.active = false;				
			},
			unpause: function(){			
				document.onkeydown = undefined;			
				loop.active = true;				
			},
			gameOver: function(){
				if(this.isDebug) return;
				global.timeSurvived = {
					days: this.day,
					minutes: this.day == 0 ? this.dayTimeInMinutes - this.defaults.dayTimeInMinutes : this.dayTimeInMinutes
				};
				obj.ambientMusic.stop();
				loop.room = rm.gameOver;
			}
		};
		
		// Shortcuts to world objects and functions
		var world = obj.world;
		var view = obj.world.view;
		var zombies = obj.world.gameObjects.zombies;
		var bullets = obj.world.gameObjects.bullets;
		
		obj.background = {
			depth: -1,
			width: 24,
			height: 24,
			tilesize: 128,
			tiles: [],			
			initialize: function(t) {
				t.x = 0;
				t.y = 0;
				t.tiles = new Array(t.height * t.width);	
				var length = t.tiles.length;
				for (var i = 0,len = length; i < len; ++i){
					t.add(i,'grass');
				}
				
				t.add(3,'grass1');
				t.add(24,'grass2');
				t.add(25,'grass1');				
			},
			add: function(pos, name){
				var tileY = (Math.floor(pos / this.width)) * this.tilesize;
				var tileX = (pos * this.tilesize) - (tileY * this.width );
				this.tiles[pos] = {sprite: spr.tilemap[name], x: tileX, y: tileY};
			},
			tick: function(t){
				t.x = t.x + world.origin.x;
				t.y = t.y + world.origin.y;
			},
			draw: function(t) {
				var x = t.x;
				var y = t.y;
				var length = t.tiles.length;
				for (var i = 0,len = length; i < len; ++i){
					var tile = t.tiles[i];
					if(!tile) continue;					
					tile.sprite.draw(x + tile.x,y + tile.y);
				}					
			}
		};
		
		obj.ambientMusic = {
			initialize: function(t){
				snd.loops.ambient.play(0.5);
			},
			stop: function(){
				snd.loops.ambient.stop();
			}
		}

		obj.light = {		
			defaults: {
				renderFlashlight: false,
				renderMuzzleFlash: false,
				maxAlpha: 0.95,
				alphaGradientSunrise: 0.0,
				alphaGradientSunset: 0.0
			},
			displayCtx: undefined,
			renderingStack: [],
			initialize: function(t) {
				Object.extend(this, this.defaults);
				var canvas = document.getElementById('light');
				t.displayCtx  = canvas.getContext('2d');				
				t.prepareRenderingStack(t);	
				t.alphaGradientSunrise = t.maxAlpha / world.sunriseDuration;
				t.alphaGradientSunset = t.maxAlpha / world.sunsetDuration;
			},
			prepareRenderingStack: function(t){
				/*
					0 ctx1.lineTo(point1.x, point1.y);
					1 ctx1.lineTo(center.x, center.y);
					2 ctx1.lineTo(point2.x, point2.y);
					3 ctx1.lineTo(WIDTH, 0);					
					4 ctx1.lineTo(WIDTH, HEIGHT);
					5 ctx1.lineTo(0, HEIGHT);
					6 ctx1.lineTo(0, 0);
				*/
				t.renderingStack = [];	
				t.renderingStack.push(function(ctx){
					ctx.lineTo(obj.rayCaster.firstRay.x, obj.rayCaster.firstRay.y);
				});				
				t.renderingStack.push(function(ctx){
					var coronaStartAngle = Math.pointDirection(obj.player.x, obj.player.y,obj.rayCaster.firstRay.x, obj.rayCaster.firstRay.y);
					var coronaEndAngle = Math.pointDirection(obj.player.x, obj.player.y,obj.rayCaster.lastRay.x, obj.rayCaster.lastRay.y);
					ctx.lineTo(obj.player.x, obj.player.y);
					ctx.arc(obj.player.x,obj.player.y,65,coronaStartAngle,coronaEndAngle,true);
				});				
				t.renderingStack.push(function(ctx){
					ctx.lineTo(obj.rayCaster.lastRay.x, obj.rayCaster.lastRay.y);
				});				
				t.renderingStack.push(function(ctx){
					ctx.lineTo(PP.view.width, 0);	
				});				
				t.renderingStack.push(function(ctx){
					ctx.lineTo(PP.view.width, PP.view.height);
				});				
				t.renderingStack.push(function(ctx){
					ctx.lineTo(0, PP.view.height);
				});				
				t.renderingStack.push(function(ctx){
					ctx.lineTo(0, 0);
				});
				t.renderingStack.swap = function(indexOfElement1, indexOfElement2){		
					var temp = this[indexOfElement1];
					this[indexOfElement1] = this[indexOfElement2];
					this[indexOfElement2] = temp;
				};
			},
			tick: function(t) {},
			getPoint: function(pointSource){
				var point = pointSource;
				if(point.x < 0) { point.x = 0};
				if(point.y < 0) { point.y = 0};
				if(point.x > PP.view.width) { point.x = PP.view.width};
				if(point.y > PP.view.height) { point.y = PP.view.height};
				return point;				
			},
			draw: function(t){
				var ctx = t.displayCtx;
				PP.draw.clear(ctx);		
				var alpha = obj.world.isDay ? 0 : t.maxAlpha;	
				
				if(obj.world.isSunset){
					var minutesUntilSunset = world.dayTimeInMinutes - world.sunsetStart;						
					alpha = t.alphaGradientSunset * minutesUntilSunset;	
					if(minutesUntilSunset >= world.sunsetDuration){
						obj.world.isSunset = false;
						obj.world.isDay = false;
					}
				}
				else if(obj.world.isSunrise){
					var minutesUntilSunrise =  world.dayTimeInMinutes  - world.sunriseStart;
					alpha = 1 - (t.alphaGradientSunrise * minutesUntilSunrise);
					if(minutesUntilSunrise >= world.sunriseDuration){
						obj.world.isSunrise = false;
						obj.world.isDay = true;
					}
				}		
				
				ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
				
				if(t.renderMuzzleFlash){
					if(alpha >= 0.3 && !t.renderFlashlight){
						ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';							
					}
					t.renderMuzzleFlash = false;
				}
				
				ctx.moveTo(0, 0);
				
				var stack = Object.create(t.renderingStack);

				if(!t.renderFlashlight) {
					stack.splice(0,3);
				}
				else{
					var point1 = t.getPoint(obj.rayCaster.firstRay);
					var point2 = t.getPoint(obj.rayCaster.lastRay);					
					
					if(point1.y == point2.y && point1.x == point2.x){
						stack.splice(0,2);
					}
					else if(point1.y == point2.y){
						if(point1.x > point2.x){
							//lower x-axis
							stack.swap(0,3);
							stack.swap(1,4);
							stack.swap(2,3);
							stack.swap(3,4);
						}
					}
					else if(point1.x == point2.x){
						if(point1.y < point2.y){
							//right y-axis
							stack.swap(0,1);
							stack.swap(2,3);
							stack.swap(2,0);
						}
						else{
							//left y-axis
							stack.swap(0,3);
							stack.swap(1,4);
							stack.swap(2,5);
						}
					}
					else{
						//p1 on upper x-axis, p2 on right y-axis
						if(point1.y == 0 && point2.y < PP.view.height && point2.x == PP.view.width){
							stack.splice(3,1);
						}
						//p1 on lower x-axis, p2 on left y-axis
						else if(point1.y == PP.view.height && point2.y > 0 && point2.x == 0){
							stack.swap(0,3);
							stack.swap(1,4);
							stack.swap(2,3);
							stack.swap(3,4);
							stack.splice(5,1);				
						}
						//p1 on left y-axis, p2 on upper x-axis
						else if(point1.x == 0 && point2.x < PP.view.width && point2.y == 0){
							ctx.moveTo(0, PP.view.height);
							stack.pop();
						}
						//p1 on right y-axis, p2 on lower x-axis
						else if(point1.x == PP.view.width && point2.x > 0 && point2.y == PP.view.height){
							stack.swap(0,1);
							stack.swap(2,3);
							stack.swap(2,0);
							stack.splice(4,1);
						}
						else{
							alert('Invalid state: P1.x:'+point1.x +' P1.y:'+point1.y +' P2.x:'+ point2.x+' P2.y:'+point2.y);
						}
					}	
				}					
					
				ctx.beginPath();	
				for(var i=0;i<stack.length;i++){
					stack[i].call(this, ctx);
				}	
				
				ctx.closePath();							
				ctx.fill();	
				
				if(t.renderFlashlight) {
					ctx.fillStyle = 'rgba(255, 255, 102, 0.15)';	
					ctx.beginPath();
					ctx.arc(obj.player.x,obj.player.y,45,Math.PI*2,0,true);					
					ctx.lineTo(obj.player.x,obj.player.y);
					ctx.closePath();
					ctx.fill();			
				}				
			},
			enableFlashlightRendering: function(){
				this.renderFlashlight = true;
			},
			disableFlashlightRendering: function(){
				this.renderFlashlight = false;
			},
			triggerMuzzleflash: function(){
				this.renderMuzzleFlash = true;
			}
		}
		
		obj.flashlight = {		
			defaults: {
				isActive: false,	
				battery: {
					power: 300,
					maxPower: 300,
					tick: function(){
						if(this.power <= 0){
							obj.flashlight.disable();
						}
						if(obj.flashlight.isActive){
							this.power--;							
						}
						else{
							if(this.power < this.maxPower){
								this.power++;
							}
						}
					}
				}
			},
			initialize: function(t){
				Object.extend(this, this.defaults);
				t.battery.power = t.battery.maxPower;
			},	
			toggle: function(){
				return this.isActive ? this.disable(): this.enable();
			},
			enable: function(){
				if(this.battery.power <= 0) return;
				this.isActive = true;
				obj.light.enableFlashlightRendering();
			},
			disable: function(){
				this.isActive = false;
				obj.light.disableFlashlightRendering();
			},
			tick: function(t){						
				t.battery.tick();		
				if(key.space.down){
					this.toggle();				
				}
			}
		}
		
		obj.debug = {
			testMode: false,
			output: {
				objects: [],
				add: function(obj, property, name){
					this.objects.push({toString: function(){return ( name || property) + ':' + obj[property];}});
				},
				clear: function(){
					this.objects = [];
				}
			},				
			initialize: function(t){
				t.output.clear();
				t.output.add(obj.world,'dayTimeInMinutes');
				t.output.add(obj.world,'isDay');
				t.output.add(obj.world,'isSunrise');
				t.output.add(obj.world,'isSunset');
				t.output.add(obj.world.origin,'x','origin.x');
				t.output.add(obj.world.origin,'y','origin.y');
				t.output.add(mouse,'x','mouse.x');
				t.output.add(mouse,'y','mouse.y');
				t.output.add(obj.world.playerPos,'x','player.x');
				t.output.add(obj.world.playerPos,'y','player.y');
				t.output.add(obj.player.rotation,'radians');
				t.output.objects.push({toString: function(){return 'bullet_radians:'  + (bullets[bullets.length-1] != undefined ? bullets[bullets.length-1].rotation.radians : '');}});
				t.output.add(obj.player.currentGun,'currentReloadDelay');
			},
			tick: function(t){
				if(key.o.down){
					obj.gui.isDebug = !obj.gui.isDebug;
					obj.rayCaster.isDebug = !obj.rayCaster.isDebug;
					obj.world.isDebug = !obj.world.isDebug;
				}				
				if(key.g.down){
					obj.world.gameOver();
				}
				if(key.t.down){
					t.testMode = !t.testMode;
				}
				if(t.testMode){
					for (var i = 0,len = zombies.length; i < len; ++i){
						if(!zombies[i]) continue;
						zombies[i].destroy();
					}
					obj.flashlight.battery.power = obj.flashlight.battery.maxPower;
				}
			}
		};
		
		obj.gui = {
			isDebug: false,			
			displayCtx: undefined,
			defaults:{
				font:'normal 12px Verdana',
				color:'white',
				flashlightUi: {
					x: 580,
					y: 20,
					width: 50,
					height: 10,
					increment: 0,					
					initialize: function(parent){
						this.increment = this.width / obj.flashlight.battery.maxPower;
						this.parent = parent;
					},
					draw: function(){
						var ctx = this.parent.displayCtx;
						ctx.strokeStyle = '#FFC83F';
						ctx.fillStyle = '#FFFD9E';
						ctx.fillRect(this.x,this.y,this.increment * obj.flashlight.battery.power,this.height);						
						ctx.strokeRect(this.x,this.y,this.width,this.height);
						ctx.textAlign = 'right';						
						this.parent.displayText(this.x,this.y-5, 'Flashlight', '#fff', 'normal 10px Verdana', 'left');
					}
				},
				healthUi: {
					x: 8,
					y: 465,
					width: 50,
					height: 10,
					increment: 0,					
					initialize: function(parent){
						this.increment = this.width / obj.player.defaults.health;
						this.parent = parent;
					},
					draw: function(){
						var ctx = this.parent.displayCtx;
						var health = obj.player.health;
						switch(true){
							case (health >= 35 && health < 75):
								ctx.strokeStyle = '#fff';
								ctx.fillStyle = 'orange';							
								break;
							case (health >= 75):
								ctx.strokeStyle = '#fff';
								ctx.fillStyle = 'green';
								break;
							default:
								ctx.strokeStyle = '#fff';
								ctx.fillStyle = 'red';
								break;
						}

						ctx.fillRect(this.x,this.y,this.increment * health,this.height);						
						ctx.strokeRect(this.x,this.y,this.width,this.height);
						ctx.textAlign = 'right';						
						this.parent.displayText(this.x,this.y-5, 'Health', '#fff', 'normal 10px Verdana', 'left');
					}
				}
			},
			initialize: function(t) {
				Object.extend(this, this.defaults);
				var canvas = document.getElementById('gui');
				t.displayCtx  = canvas.getContext('2d');	
				t.displayCtx.globalAlpha = 1.0;
				t.healthUi.initialize(this);
				t.flashlightUi.initialize(this);
			},
			tick: function(t){
				
			},			
			displayText: function(x, y, text, color, font, textAlign){
				var ctx = this.displayCtx;
				ctx.font = font || this.font;
				ctx.fillStyle = color || this.color;
				ctx.textAlign = textAlign || 'left';
				ctx.fillText(text, x || 0, y || 0);	
			},			
			debugOutput: function(t){
				var ctx = this.displayCtx;
				ctx.textAlign = 'left';	
				ctx.font = 'normal normal normal 10px Arial';
				ctx.fillStyle = 'white';
				var output = obj.debug.output.objects;				
				var outputLength = output.length;
				for (var i=0,len = outputLength; i<len; ++i){
					ctx.fillText(output[i].toString(), 0, 20*i);
				}				
			},
			draw: function(t){
				PP.draw.clear(t.displayCtx);	
				var defaultColor = t.color;				
				if(obj.world.isPaused){
					t.displayText(320,20,'Game paused. Press "P" to continue','yellow','bold 12px Verdana','center');
				}
				t.healthUi.draw();
				t.displayText(630,455,obj.player.currentGun.name,defaultColor,'normal 12px Verdana','right');
				t.displayText(630,470,'Ammo: ' + obj.player.currentGun.currentAmmoInMag + ' / ' + obj.player.currentGun.currentAmmo,defaultColor, 'bold 12px Verdana', 'right');			
				t.flashlightUi.draw();
				if(t.isDebug){
					t.debugOutput();
				}
			}
		};
		
		obj.bullet = {
			parent: {
				rotation: undefined,
				trace: [],
				initialize: function(t) {
					t.indexOf = bullets.length;
					bullets[t.indexOf] = t;					
					t.rotation = new Rotation();					
					t.rotation.rotateToMousePos(t.x,t.y);			
				},
				destroy: function(){
					loop.remove(this);
					delete bullets[this.indexOf];
				},
				tick: function(t) {
					if(!world.contains(t)){
						t.destroy();
					}					
					var trace = [];
					for (var i = 0,s = t.vspeed / 5; i <= s; ++i){
						move.direction(t, t.rotation.radians, 5);
						trace.push({x: t.x, y: t.y});						
					}
					t.trace = trace;					
				},
				collision: function(obj){ 					
					var vspeed = this.vspeed;
					var xVariation = obj.x - this.x;
					var yVariation = obj.y - this.y;
					//if obj is farther away than vspeed do not test any further, since bullet is not in reach
					if(xVariation > vspeed || xVariation < -vspeed || yVariation > vspeed || yVariation < -vspeed){
						return false;
					}
					var isCollision = false;
					for (var i = 0,len = this.trace.length; i < len; ++i){
						isCollision = collision.point(obj,this.trace[i].x,this.trace[i].y) ? true : isCollision;
					}
					return isCollision;
				},
				draw: function(t){
					var point2 = {
						x: t.x,
						y: t.y						
					};
					move.direction(point2, t.rotation.radians, 8);
					draw.line(t.x,t.y,point2.x,point2.y,1,'yellow');
					//t.sprite.draw(t.x,t.y,0,t.rotation.radians);
				}	
			},			
			cal9mm: {
				mask: [[-0.5,0],[-8,-0.5],[-8,0.5],[-8,0.5]],	
				//sprite: spr.bullet.cal9mm,
				vspeed: 80
			}
		};
		
		obj.bullet.cal9mm.proto = obj.bullet.parent;
		
		var Scattering = function(minInDegrees, maxInDegrees, incrementInDegrees, delayInSeconds){			
			var min = Math.degToRad(minInDegrees);
			var max = Math.degToRad(maxInDegrees);
			var increment = Math.degToRad(incrementInDegrees);
			var decrement = increment / (loop.rate * delayInSeconds);
			this.current = min || 0.0;		
			this.scatter = function(obj){
				var prefix = Math.random() > 0.5 ? -1 : 1;
				var current = this.current;
				obj.rotation.radians += (prefix * Math.random() * current);
			};
			this.increase = function(){
				this.current += increment;
				if(this.current > max){
					this.current = max;
				}
			};
			this.decrease = function(){
				this.current -= decrement;
				if(this.current < min){
					this.current = min;
				}
			};
			return this;
		}
		
		obj.weapon = {
			parent: {	
				sprite: spr.player.pistol,
				muzzleVariation: {
					radians: 0.18,
					length: 50
				},
				muzzleflash: {
					sprite: spr.muzzleflash,
					renderOnce: false,
					trigger: function(x, y, variation){
						this.rotation = new Rotation();
						this.rotation.rotateToMousePos(x,y);
						this.x = x;
						this.y = y;
						this.renderOnce = true;					
						move.direction(this, this.rotation.get()+variation.radians, variation.length);
						obj.light.triggerMuzzleflash();	
					},
					draw: function(){
						if(!this.renderOnce) return;						
						this.sprite.draw(this.x,this.y,0,this.rotation.get());
						this.renderOnce = false;
					}
				},
				isActive: false,
				currentShootDelay: 0,
				currentReloadDelay: 0,
				isReloading: false,
				activate: function(){
					obj.player.setSprite(this.sprite);				
					this.isActive = true;
				},
				deactivate: function(){
					this.isActive = false;
				},
				shoot: function(x, y, rotation1){
					if(this.isReloading){
						return;
					}
					if(this.currentShootDelay > 0){
						return;
					}					
					if(this.currentAmmoInMag <= 0){
						snd.manager.play(this.soundOnEmpty.name, this.soundOnEmpty.volume);
						return;
					}					
					this.currentAmmoInMag -= 1;																								
					snd.manager.play(this.soundOnShoot.name, this.soundOnShoot.volume);
					this.muzzleflash.trigger(x, y, this.muzzleVariation);	
					var bullet = loop.beget(this.bullet, x, y);	
					this.scattering.scatter(bullet);
					this.currentShootDelay = this.shootDelay;
					this.scattering.increase();	
				},
				reload: function(){
					snd.manager.play(this.soundOnReload.name, this.soundOnReload.volume);
					if(this.isReloading){
						return;
					}
					this.isReloading = true;	
					this.currentReloadDelay = this.reloadDelay;		
				},		
				reloaded: function(){
					var ammoNeededToReload = this.maxAmmoInMag - this.currentAmmoInMag;
					var ammoToFill = this.currentAmmo > ammoNeededToReload ? ammoNeededToReload : this.currentAmmo;
					this.currentAmmoInMag += ammoToFill;
					this.currentAmmo -= ammoToFill;		
				},
				tick: function(t){
					if(!t.isActive) return;					
					this.currentShootDelay -= 1;
					this.currentReloadDelay -= 1;
					t.scattering.decrease();
					if(this.currentReloadDelay <= 0 && this.isReloading) {
						this.isReloading = false;
						this.reloaded();
					}
				},
				draw: function(t){
					t.muzzleflash.draw();
				}
			},			
			glock17: {
				scattering: new Scattering(0.0, 5.0, 1.0, 0.5), 
				triggered: function(){ 
					return key.q.down || mouse.left.down;
				},					
				shootDelay: 0,
				reloadDelay: 21,
				maxAmmoInMag: 14,
				maxAmmo: 500,
				currentAmmoInMag: 14,
				currentAmmo: 240,
				bullet: obj.bullet.cal9mm,
				soundOnShoot: {name: '9mm', volume: 1.0},
				soundOnEmpty: {name: 'pistol_empty', volume: 0.5},
				soundOnReload: {name: 'pistol_reload', volume: 0.8},
				muzzleVariation: {radians: 0.18,length: 50},
				name: 'Glock 17'
			},
			mp5: {
				scattering: new Scattering(0.0, 30.0, 5.0, 0.2),
				triggered: function(){ 
					if(this.currentAmmoInMag <= 0){
						return mouse.left.down;
					}
					return key.q.pressed || mouse.left.pressed;
				},		
				sprite: spr.player.mp5,
				shootDelay: 2,
				reloadDelay: 20,
				maxAmmoInMag: 30,
				maxAmmo: 500,
				currentAmmoInMag: 14,
				currentAmmo: 500,
				bullet: obj.bullet.cal9mm,
				soundOnShoot: {name: '9mm', volume: 1.0},
				soundOnEmpty: {name: 'pistol_empty', volume: 0.5},
				soundOnReload: {name: 'pistol_reload', volume: 0.8},
				muzzleVariation: {radians: 0.33,length: 40},
				name: 'MP5'
			}
		}
		
		obj.weapon.glock17.proto = obj.weapon.parent;
		obj.weapon.mp5.proto = obj.weapon.parent;
		
		obj.player = {
			defaults: {
				sprite: spr.player.pistol,
				health: 100,
				maxHealth: 100,
				vspeed: 5,
				rotation: new Rotation(),
				guns: [],
				currentGun: undefined,
			},
			initialize: function(t) {	
				Object.extend(this, this.defaults);
				t.x = PP.view.width / 2;
				t.y = PP.view.height / 2;
				world.playerPos.x = t.x;
				world.playerPos.y = t.y;				
				t.guns[1] = loop.beget(obj.weapon.glock17);
				t.guns[2] = loop.beget(obj.weapon.mp5);
				t.currentGun = t.guns[1];		
				t.currentGun.activate();	
				t.health = t.maxHealth;
				t.movementCoord.init();				
			},
			setSprite: function(sprite){
				this.sprite = sprite;
			},
			takeDamage: function(damage){
				this.health -= damage;
				if(this.health <= 0){
					this.health = 0;
					obj.world.gameOver();
				};
			},
			movementCoord: {
				top: 0,
				bottom: 0,
				maxBottom: 0,
				left: 0,
				right: 0,				
				init: function(){
					this.top = PP.view.height * 0.25;
					this.bottom = PP.view.height * 0.75;
					this.left = PP.view.width * 0.25;
					this.right = PP.view.width * 0.75;
					this.maxBottom = 2000 - (PP.view.height * 0.25);
					this.maxRight = 2000 - (PP.view.height * 0.25);
				}
			},
			move: function(t){
				if(key.w.pressed){
					if(t.y <= 20) {
					
					}
					else if(t.y < t.movementCoord.top){
						if(world.playerPos.y > t.movementCoord.top && world.playerPos.y < t.movementCoord.maxBottom){
							world.origin.y += t.vspeed;
							world.playerPos.y -= t.vspeed;
						}
						else {
							t.y -= t.vspeed;
							world.playerPos.y -= t.vspeed;
						}
					}
					else{
						t.y -= t.vspeed;
						world.playerPos.y -= t.vspeed;
					}					
				}
				if(key.s.pressed){	
					if(world.playerPos.y >= 1980) {
					
					}
					else if(t.y > t.movementCoord.bottom){
						if(world.playerPos.y > t.movementCoord.bottom && world.playerPos.y > t.movementCoord.top){
							world.origin.y -= t.vspeed;
							world.playerPos.y += t.vspeed;
						}
						else {
							t.y += t.vspeed;
							world.playerPos.y += t.vspeed;
						}
					}
					else {
						t.y += t.vspeed;
						world.playerPos.y += t.vspeed;
					}			
				}
				if(key.a.pressed){		
					if(t.x <= 20) {
					
					}
					else if(t.x < t.movementCoord.left){
						if(world.playerPos.x > t.movementCoord.left && world.playerPos.x < t.movementCoord.maxRight){
							world.origin.x += t.vspeed;
							world.playerPos.x -= t.vspeed;
						}
						else {
							t.x -= t.vspeed;
							world.playerPos.x -= t.vspeed;
						}
					}
					else{
						t.x -= t.vspeed;
						world.playerPos.x -= t.vspeed;
					}	
				}
				if(key.d.pressed){				
					if(world.playerPos.x >= 1980) {
					
					}
					else if(t.x > t.movementCoord.right){
						if(world.playerPos.x > t.movementCoord.right && world.playerPos.x > t.movementCoord.left){
							world.origin.x -= t.vspeed;
							world.playerPos.x += t.vspeed;
						}
						else {
							t.x += t.vspeed;
							world.playerPos.x += t.vspeed;
						}
					}
					else {
						t.x += t.vspeed;
						world.playerPos.x += t.vspeed;
					}	
				}
				t.lastOrigin = world.origin;
				t.lastX = t.x;
				t.lastY = t.y;
			},
			toLastPos: function(){
				if(!this.lastOrigin) return;
				world.origin.x = -this.lastOrigin.x;
				world.origin.y = -this.lastOrigin.y;
				this.x = this.lastX;
				this.y = this.lastY;
			},
			tick: function(t) {
				if(t.currentGun.triggered()){
					t.currentGun.shoot(t.x, t.y, t.rotation.radians);				
				}
				if(key.r.down){
					t.currentGun.reload();
				}
				if(key['1'].down){
					t.switchGun(t.guns[1]);
				}
				else if(key['2'].down){
					t.switchGun(t.guns[2]);
				}
				t.rotation.rotateToMousePos(t.x,t.y);
				t.move(t);
			},
			switchGun: function(newGun){
				if(!newGun) {
					return;
				}
				this.currentGun.deactivate();
				this.currentGun = newGun;
				this.currentGun.activate();
			},
			draw: function(t) {				
				t.sprite.draw(t.x,t.y,0,t.rotation.get());
			}		
		};
		
		obj.zombie = {
			parent: {
				mask: [[-16,9],[-16,-11],[8,-16],[8,12]],
				rotation: new Rotation(),
				currentAttackDelay: 0,				
				destroy: function(){
					loop.remove(this);
					delete zombies[this.indexOf];
				},		
				setStartingPosition: function(t){
					var side = Math.floor(Math.random()*4);
					switch(side){
						case 0: //right
							t.x = 639;
							t.y = Math.floor(Math.random()*480);	
						break;
						case 1: //bottom
							t.x = Math.floor(Math.random()*640);
							t.y = 439;		
						break;
						case 2: //left
							t.x = 1;
							t.y = Math.floor(Math.random()*480);	
						break;
						case 3: //top
							t.x = Math.floor(Math.random()*640);
							t.y = 1;	
						break;
						default:
							alert(side);
						break;
					}
				},
				initialize: function(t) {
					t.rotation = new Rotation();
					t.setStartingPosition(t);		
					t.indexOf = zombies.length;
					zombies[t.indexOf] = t;
					var randomNumber = Math.floor(Math.random()*5) + 1;
					snd.manager.play('zombie' + randomNumber);
				},			 
				tick: function(t) {
					t.currentAttackDelay--;
					t.x = t.x + world.origin.x;
					t.y = t.y + world.origin.y;

					for(var i = 0;i < bullets.length;i++){
						var bullet = bullets[i];
						if(!bullet){
							continue;
						}						
						if(bullet.collision(t)){
							bullet.destroy();
							snd.manager.play('zombie_killed');
							t.destroy();
						}
					}	
					if(collision.point(t,obj.player.x,obj.player.y)){
						t.rotation.rotateToObj(t.x,t.y,obj.player);		
						t.attack(obj.player);
					}
					else{
						if(t.currentAttackDelay <= 0){
							t.rotation.rotateToObj(t.x,t.y,obj.player);									
							move.direction(t, t.rotation.get(), t.vspeed);
						}
					}
				},	
				attack: function(target){	
					if(this.currentAttackDelay > 0) return;
					this.currentAttackDelay = this.attackDelay;
					target.takeDamage(this.damage);
				},
				draw: function(t) {
					t.sprite.draw(t.x,t.y,0,t.rotation.get());
				}
			},
		 
			red: {
				attackDelay: 10,
				damage: 1,
				vspeed: 4,
				sprite: spr.zombie.red
			},
		 
			blue: {
				attackDelay: 10,
				damage: 1,
				vspeed: 2,
				sprite: spr.zombie.blue
			},
		 
			green: {
				attackDelay: 10,
				damage: 1,
				vspeed: 1,
				sprite: spr.zombie.green
			}
		};

		obj.zombie.red.proto = obj.zombie.parent;
		obj.zombie.blue.proto = obj.zombie.parent;
		obj.zombie.green.proto = obj.zombie.parent;
		
		obj.staticObj = {
			mask: [[-25,0],[-25,50],[25,50],[25,0]],
			tick: function(t) {
				t.x = t.x + world.origin.x;
				t.y = t.y + world.origin.y;
				if(collision.point(t,obj.player.x,obj.player.y)){
					obj.player.toLastPos();
				}
			},
			draw: function(t) {
				draw.rectangle(t.x-50,t.y-50,50,50,undefined,'red');
			}
		}
		
		obj.rayCaster = {
			fov: 65,
			rayCount: 3,
			rays: [],
			isDebug: false,
			firstRay: undefined,
			lastRay: undefined,
			centerRay: undefined,
			initialize: function(t) {
				var rayCount = t.rayCount - (t.rayCount % 2) + 1; //only uneven numbers are allowed	  
				var degreesPerRay = t.fov / rayCount;	
				var lowerBound = Math.floor(rayCount / 2) * -1;
				var upperBound = Math.floor(rayCount / 2);
				for(var i = lowerBound; i <= upperBound;i++){
					var angle = (degreesPerRay * 0.017453292519943295 * i);
					var ray = Object.create(obj.ray);					
					ray.variance = angle;
					t.rays.push(ray);	
					if(i == 0){
						t.centerRay = ray;				
					}
					if(!t.firstRay){
						t.firstRay = ray;
					}
				}
				t.lastRay = t.rays[t.rays.length - 1];
			},
			tick: function(t){
				for(var i = 0; i < t.rays.length; i++){
					t.rays[i].tick(t.rays[i]);
				}				
			},
			draw: function(t){
				if(t.isDebug){
					for(var i = 0; i < t.rays.length; i++){
						t.rays[i].draw(t.rays[i]);
					}
				}
			}
		}
		
		obj.ray = {
			variance: 0,
			tick: function(t){			
				t.x = obj.player.x;
				t.y = obj.player.y;	
				while(view.contains(t)){			
					move.direction(t, obj.player.rotation.radians + t.variance, 100);
				}			
			},
			draw: function(t) {
				//only for debug usage
				draw.line(obj.player.x,obj.player.y,t.x,t.y,2,'red')
			}
		}			
		
		rm.play = function() {
			var loadingmask = document.getElementById('loadingmask');
			loadingmask.style.display = "none";

			loop.register(obj.background);		
			loop.register(obj.ambientMusic);
			loop.register(obj.world);			
			loop.register(obj.light);
			loop.register(obj.flashlight);
			loop.register(obj.player);
			loop.register(obj.rayCaster);
			loop.register(obj.gui);
			loop.register(obj.debug);
			
			/*var staticTest = obj.staticObj;
			staticTest.x= 30;
			staticTest.y= 30;
			loop.beget(staticTest);*/
			
			var zombieSpawn = new Alarm(function() {
				if(!obj.world.isDay){
					var zombie = obj.zombie;					
					loop.beget(Math.choose(zombie.red,zombie.blue,zombie.green));
				}
				this.time = loop.rate*2;
			});
			
			// Set the initial alarm time to 0 so it will trigger right away.
			zombieSpawn.time = 0;			
		};
		
		obj.gameOver = {
			ticksFadeIn: 0,
			alphaGradient: 0,
			timeSurvivedMessage: '',
			settings:{
				ticksFadeIn: 200				
			},
			initialize: function(t){
				t.clearCanvas('light');
				t.clearCanvas('gui');				
				t.timeSurvivedMessage = t.getTimeSurvivedMessage();
			},
			getTimeSurvivedMessage: function(){
				var message = 'You survived {days} and {hours} and {minutes}.';
				var minutes = global.timeSurvived.minutes % 60;
				var hours = (global.timeSurvived.minutes - minutes) / 60;		
				var days = global.timeSurvived.days;
				return message.replace(/{days}/,days + (days == 1 ? ' day' : ' days')).replace(/{hours}/,hours + (hours == 1 ? ' hour' : ' hours')).replace(/{minutes}/,minutes + (minutes == 1 ? ' minute' : ' minutes'));
			},			
			clearCanvas: function(canvasId){
				var canvas = document.getElementById(canvasId);
				var ctx  = canvas.getContext('2d');
				PP.draw.clear(ctx);	
			},
			tick: function(t) {
				if (key.enter.down) {
					loop.room = rm.play;
				}
			},			
			draw: function(t) {			
				draw.textHalign = 'center';	
				draw.color = '#fff';
				draw.font = 'normal normal normal 12px Verdana';
				draw.textValign = 'alphabetic';
				draw.text(320,465,'Press enter to start a new game');								
				var ctx = draw.displayCanvas.ctx;	
				ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';	
				ctx.fillRect(80,200,520,140);
				draw.color = '#fff';
				draw.font = 'bold 24px Verdana';
				ctx.fillText('Game Over', 320,240);
				draw.font = 'normal 12px Verdana';
				ctx.fillText(t.timeSurvivedMessage, 320,300);						
				ctx.shadowBlur = 0;
				
			}
		};
		
		obj.gameOverFadeIn = {
			ticksFadeIn: 0,
			alphaGradient: 0,
			settings:{
				ticksFadeIn: 30				
			},
			displayCtx: undefined,
			initialize: function(t) {
				var canvas = document.getElementById('gui');
				t.displayCtx  = canvas.getContext('2d');	
				t.ticksFadeIn = t.settings.ticksFadeIn;				
				t.alphaGradient = 1.0 / t.settings.ticksFadeIn;		
			},
			tick: function(t){
				if(t.ticksFadeIn > 0){
					t.ticksFadeIn--;
				}
			},
			displayText: function(text, x, y, color, font){
				var ctx = this.displayCtx;
				ctx.font = font || this.defaults.font;
				ctx.fillStyle = color || this.defaults.color;
				ctx.fillText(text, x || 0, y || 0);	
			},
			draw: function(t){
				var ctx = t.displayCtx;
				PP.draw.clear(ctx);	
				if(t.ticksFadeIn > 0){
					ctx.globalAlpha = t.alphaGradient * t.ticksFadeIn;
					ctx.fillStyle = "white";
					ctx.fillRect(0,0,PP.view.width,PP.view.height);						
				}	
			}
		};
		
		obj.gameMenuBackground = {
			draw: function(t) {
				spr.menubg.draw(0,0);
			}
		};
		
		obj.gameMenu = {
			initialize: function(t) {
				snd.manager.play('nightfall', 0.6);
			},
			tick: function(t) {
				if (key.enter.down||startGameByTouchEvent) {
					startGameByTouchEvent = false;
					loop.room = rm.play;
				}
			},
			draw: function(t) {
				draw.textHalign = 'center';	
				draw.color = 'white';
				draw.font = 'normal normal normal 12px Verdana';
				draw.textValign = 'alphabetic';
				draw.text(320,465,'Press enter to start a new game');
			}
		};
		
		rm.gameOver = function() {
			loop.register(obj.gameMenuBackground,0,0);
			loop.register(obj.gameOver);
			loop.register(obj.gameOverFadeIn);
		};
		
		rm.gameMenu = function() {
			loop.register(obj.gameMenuBackground,0,0);
			loop.register(obj.gameMenu);
		};
		
		loop.active = true;
		loop.room = rm.gameMenu;
	};
	
	/* hacky approach to enable game start on mobile devices */
	var startGameByTouchEvent = false;
	
	var onLoadCompleted = function(){
		document.body.addEventListener("touchstart",	function(evt) {
				startGameByTouchEvent = true;
			}, 
			false
		);
	}
	
	var loadingBar = document.getElementById('loadingmask');

	var showLoadStatus = function(itemsToLoad){
		var itemsLoaded = PP.load.completed;
		if(itemsToLoad == itemsLoaded){
			loadingBar.innerHTML = 'Completed';
			onLoadCompleted();
			return;
		}
		loadingBar.innerHTML = 'Loading - ' + itemsLoaded + ' of ' + itemsToLoad;
		setTimeout(showLoadStatus, 30);
	}
  
  return {
    init: function(){      
      engine.load(onGameLoaded);
      showLoadStatus(PP.load.total);
    }
  }
});
var SecretHitler = (function () {
'use strict';

var AssetManager = { 
	manifest: {
		models: {
			board: 'model/table.dae',
			tophat: 'model/tophat.dae',
			visorcap: 'model/visor_cap.dae'
		},
		textures: {
			board_large: 'img/board-large-baked.png',
			board_med: 'img/board-medium-baked.png',
			board_small: 'img/board-small-baked.png',
			cards: 'img/cards.png'
		}
	},
	cache: {},
	root: null
};

var Behavior = function Behavior(type){
	this.type = type;
};

Behavior.prototype.awake = function awake (obj){
	this.object3D = obj;
};

Behavior.prototype.start = function start (){ };

Behavior.prototype.update = function update (dT){ };

Behavior.prototype.dispose = function dispose (){ };

var Animate = (function (Behavior$$1) {
	function Animate(//{parent, pos, quat, scale, matrix, duration, callback}
		ref)
	{
		var parent = ref.parent; if ( parent === void 0 ) parent = null;
		var pos = ref.pos; if ( pos === void 0 ) pos = null;
		var quat = ref.quat; if ( quat === void 0 ) quat = null;
		var scale = ref.scale; if ( scale === void 0 ) scale = null;
		var matrix = ref.matrix; if ( matrix === void 0 ) matrix = null;
		var duration = ref.duration; if ( duration === void 0 ) duration = 600;
		var callback = ref.callback; if ( callback === void 0 ) callback = function (){};

		Behavior$$1.call(this, 'Animate');
		
		if(matrix)
		{
			// extract position/rotation/scale from matrix
			pos = new THREE.Vector3();
			quat = new THREE.Quaternion();
			scale = new THREE.Vector3();
			matrix.decompose(pos, quat, scale);
		}

		Object.assign(this, {parent: parent, pos: pos, quat: quat, scale: scale, duration: duration, callback: callback});
	}

	if ( Behavior$$1 ) Animate.__proto__ = Behavior$$1;
	Animate.prototype = Object.create( Behavior$$1 && Behavior$$1.prototype );
	Animate.prototype.constructor = Animate;

	Animate.prototype.awake = function awake (obj)
	{
		Behavior$$1.prototype.awake.call(this, obj);

		// shuffle hierarchy, but keep world transform the same
		if(this.parent && this.parent !== obj.parent)
		{
			obj.applyMatrix(obj.parent.matrixWorld);
			var mat = new THREE.Matrix4().getInverse(this.parent.matrixWorld);
			obj.applyMatrix(mat);

			this.parent.add(obj);
		}

		// read initial positions
		this.initialPos = obj.position.clone();
		this.initialQuat = obj.quaternion.clone();
		this.initialScale = obj.scale.clone();
		this.startTime = Date.now();
	};

	Animate.prototype.update = function update ()
	{
		// compute ease-out based on duration
		var mix = (Date.now()-this.startTime) / this.duration;
		var ease = TWEEN ? TWEEN.Easing.Quadratic.Out : function (n) { return n*(2-n); };
		mix = mix < 1 ? ease(mix) : 1;

		// animate position if requested
		if( this.pos ){
			this.object3D.position.lerpVectors(this.initialPos, this.pos, mix);
		}

		// animate rotation if requested
		if( this.quat ){
			THREE.Quaternion.slerp(this.initialQuat, this.quat, this.object3D.quaternion, mix);
		}

		// animate scale if requested
		if( this.scale ){
			this.object3D.scale.lerpVectors(this.initialScale, this.scale, mix);
		}

		// terminate animation when done
		if(mix >= 1){
			this.object3D.removeBehavior(this);
			this.callback.call(this.object3D);
		}
	};

	return Animate;
}(Behavior));

Animate.start = function (target, opts) {
	var oldAnim = target.getBehaviorByType('Animate');
	if(oldAnim){
		oldAnim.constructor(opts);
		oldAnim.awake(target);
	}
	else {
		target.addBehavior( new Animate(opts) );
	}
};

// enum constants
var Types = Object.freeze({
	POLICY_LIBERAL: 0,
	POLICY_FASCIST: 1,
	ROLE_LIBERAL: 2,
	ROLE_FASCIST: 3,
	ROLE_HITLER: 4,
	PARTY_LIBERAL: 5,
	PARTY_FASCIST: 6,
	JA: 7,
	NEIN: 8,
	BLANK: 9
});

function dimsToUV(ref)
{
	var side = ref.side;
	var left = ref.left;
	var right = ref.right;
	var top = ref.top;
	var bottom = ref.bottom;

	if(side)
		{ return [[
			new THREE.Vector2(top, left),
			new THREE.Vector2(bottom, left),
			new THREE.Vector2(top, right)
		],[
			new THREE.Vector2(bottom, left),
			new THREE.Vector2(bottom, right),
			new THREE.Vector2(top, right)
		]]; }
	else
		{ return [[
			new THREE.Vector2(left, top),
			new THREE.Vector2(left, bottom),
			new THREE.Vector2(right, top)
		],[
			new THREE.Vector2(left, bottom),
			new THREE.Vector2(right, bottom),
			new THREE.Vector2(right, top)
		]]; }
}

function getUVs(type)
{
	var dims = {left: 0, right: 1, bottom: 0, top: 1};

	switch(type)
	{
	case Types.POLICY_LIBERAL:
		dims = {side: true, left: 0.834, right: 0.996, top: 0.754, bottom: 0.997};
		break;
	case Types.POLICY_FASCIST:
		dims = {side: true, left: 0.66, right: 0.822, top: 0.754, bottom: 0.996};
		break;
	case Types.ROLE_LIBERAL:
		dims = {left: 0.505, right: 0.746, top: 0.996, bottom: 0.65};
		break;
	case Types.ROLE_FASCIST:
		dims = {left: 0.505, right: 0.746, top: 0.645, bottom: 0.3};
		break;
	case Types.ROLE_HITLER:
		dims = {left: 0.754, right: 0.996, top: 0.645, bottom: 0.3};
		break;
	case Types.PARTY_LIBERAL:
		dims = {left: 0.255, right: 0.495, top: 0.996, bottom: 0.65};
		break;
	case Types.PARTY_FASCIST:
		dims = {left: 0.255, right: 0.495, top: 0.645, bottom: 0.3};
		break;
	case Types.JA:
		dims = {left: 0.005, right: 0.244, top: 0.992, bottom: 0.653};
		break;
	case Types.NEIN:
		dims = {left: 0.006, right: 0.243, top: 0.642, bottom: 0.302};
		break;
	case Types.BLANK:
	default:
		dims = {side: true, left: 0.022, right: .022+0.247, top: 0.021, bottom: .021+0.3543};
		break;
	}

	return dimsToUV(dims);
}


var Card = (function (superclass) {
	function Card(type, doubleSided, secret)
	{
		if ( type === void 0 ) type = Types.BLANK;
		if ( doubleSided === void 0 ) doubleSided = true;
		if ( secret === void 0 ) secret = false;

		superclass.call(this);

		// create the card faces
		var front = new THREE.Mesh(
			new THREE.PlaneGeometry(.3575, .5),
			new THREE.MeshBasicMaterial({map: AssetManager.cache.textures.cards})
		);
		var back = new THREE.Mesh(
			new THREE.PlaneGeometry(.3575, .5),
			new THREE.MeshBasicMaterial({map: AssetManager.cache.textures.cards})
		);
		back.position.set(0.005, 0, 0);
		back.rotateY(Math.PI);

		// set the faces to the correct part of the texture
		front.geometry.faceVertexUvs = [getUVs(type)];
		back.geometry.faceVertexUvs = [getUVs( doubleSided ? type : Types.BLANK )];

		window.test = front;

		this.add(front, back);
	}

	if ( superclass ) Card.__proto__ = superclass;
	Card.prototype = Object.create( superclass && superclass.prototype );
	Card.prototype.constructor = Card;

	return Card;
}(THREE.Object3D));

var LiberalPolicyCard = (function (Card) {
	function LiberalPolicyCard(secret){
		if ( secret === void 0 ) secret = false;

		Card.call(this, Types.POLICY_LIBERAL, false, secret);
	}

	if ( Card ) LiberalPolicyCard.__proto__ = Card;
	LiberalPolicyCard.prototype = Object.create( Card && Card.prototype );
	LiberalPolicyCard.prototype.constructor = LiberalPolicyCard;
	LiberalPolicyCard.prototype.goToPosition = function goToPosition (spot)
	{
		if ( spot === void 0 ) spot = 0;

		spot = Math.max(0, Math.min(4, spot));
		var s = LiberalPolicyCard.spots;
		Animate.start(this, {parent: AssetManager.root, pos: s['pos_'+spot], quat: s.quat, scale: s.scale});
	};

	return LiberalPolicyCard;
}(Card));

LiberalPolicyCard.spots = {
	pos_0: new THREE.Vector3(0.533, 0.76, -0.336),
	pos_1: new THREE.Vector3(0.263, 0.76, -0.336),
	pos_2: new THREE.Vector3(-.007, 0.76, -0.336),
	pos_3: new THREE.Vector3(-.279, 0.76, -0.336),
	pos_4: new THREE.Vector3(-.552, 0.76, -0.336),
	quat: new THREE.Quaternion(0, 0.7071067811865475, 0.7071067811865475, 0),
	scale: new THREE.Vector3(0.7, 0.7, 0.7)
};

var FascistPolicyCard = (function (Card) {
	function FascistPolicyCard(secret){
		if ( secret === void 0 ) secret = false;

		Card.call(this, Types.POLICY_FASCIST, false, secret);
	}

	if ( Card ) FascistPolicyCard.__proto__ = Card;
	FascistPolicyCard.prototype = Object.create( Card && Card.prototype );
	FascistPolicyCard.prototype.constructor = FascistPolicyCard;
	FascistPolicyCard.prototype.goToPosition = function goToPosition (spot)
	{
		if ( spot === void 0 ) spot = 0;

		spot = Math.max(0, Math.min(5, spot));
		var s = FascistPolicyCard.spots;
		Animate.start(this, {parent: AssetManager.root, pos: s['pos_'+spot], quat: s.quat, scale: s.scale});
	};

	return FascistPolicyCard;
}(Card));

FascistPolicyCard.spots = {
	pos_0: new THREE.Vector3(-.687, 0.76, 0.341),
	pos_1: new THREE.Vector3(-.417, 0.76, 0.341),
	pos_2: new THREE.Vector3(-.146, 0.76, 0.341),
	pos_3: new THREE.Vector3(0.127, 0.76, 0.341),
	pos_4: new THREE.Vector3(0.400, 0.76, 0.341),
	pos_5: new THREE.Vector3(0.673, 0.76, 0.341),
	quat: new THREE.Quaternion(-0.7071067811865475, 0, 0, 0.7071067811865475),
	scale: new THREE.Vector3(0.7, 0.7, 0.7)
};

var secrethitler = {
	assets: AssetManager.manifest,
	verticalAlign: 'bottom',
	initialize: function (env, root, assets) {

		// populate the shared asset cache
		AssetManager.cache = assets;
		AssetManager.root = root;

		// create the table
		var table = assets.models.board;
		var mat = new THREE.MeshBasicMaterial({ map: assets.textures.board_large });
		table.children[0].material = mat;
		table.rotation.set(-Math.PI/2, 0, 0);
		table.position.set(0, 0.75, 0);
		root.add(table);

		// create test card
		var c = new FascistPolicyCard();
		c.translateY(1.3);
		root.add(c);

		var hat = assets.models.tophat;
		hat.position.set(0.5, 1.3, 0);
		hat.rotation.set(-Math.PI/2, 0, 0);
		root.add(hat);
		
		var hat2 = assets.models.visorcap;
		hat2.position.set(-0.5, 1.3, 0);
		hat2.rotation.set(-Math.PI/2, 0, 0);
		root.add(hat2);
	}
};

return secrethitler;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hc3NldHMuanMiLCIuLi8uLi9zcmMvYmVoYXZpb3IuanMiLCIuLi8uLi9zcmMvYW5pbWF0ZS5qcyIsIi4uLy4uL3NyYy9jYXJkLmpzIiwiLi4vLi4vc3JjL3NlY3JldGhpdGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCBkZWZhdWx0IHsgXG5cdG1hbmlmZXN0OiB7XG5cdFx0bW9kZWxzOiB7XG5cdFx0XHRib2FyZDogJ21vZGVsL3RhYmxlLmRhZScsXG5cdFx0XHR0b3BoYXQ6ICdtb2RlbC90b3BoYXQuZGFlJyxcblx0XHRcdHZpc29yY2FwOiAnbW9kZWwvdmlzb3JfY2FwLmRhZSdcblx0XHR9LFxuXHRcdHRleHR1cmVzOiB7XG5cdFx0XHRib2FyZF9sYXJnZTogJ2ltZy9ib2FyZC1sYXJnZS1iYWtlZC5wbmcnLFxuXHRcdFx0Ym9hcmRfbWVkOiAnaW1nL2JvYXJkLW1lZGl1bS1iYWtlZC5wbmcnLFxuXHRcdFx0Ym9hcmRfc21hbGw6ICdpbWcvYm9hcmQtc21hbGwtYmFrZWQucG5nJyxcblx0XHRcdGNhcmRzOiAnaW1nL2NhcmRzLnBuZydcblx0XHR9XG5cdH0sXG5cdGNhY2hlOiB7fSxcblx0cm9vdDogbnVsbFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCZWhhdmlvclxue1xuXHRjb25zdHJ1Y3Rvcih0eXBlKXtcblx0XHR0aGlzLnR5cGUgPSB0eXBlO1xuXHR9XG5cblx0YXdha2Uob2JqKXtcblx0XHR0aGlzLm9iamVjdDNEID0gb2JqO1xuXHR9XG5cblx0c3RhcnQoKXsgfVxuXG5cdHVwZGF0ZShkVCl7IH1cblxuXHRkaXNwb3NlKCl7IH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEJlaGF2aW9yIGZyb20gJy4vYmVoYXZpb3InO1xuXG5jbGFzcyBBbmltYXRlIGV4dGVuZHMgQmVoYXZpb3Jcbntcblx0Y29uc3RydWN0b3IoLy97cGFyZW50LCBwb3MsIHF1YXQsIHNjYWxlLCBtYXRyaXgsIGR1cmF0aW9uLCBjYWxsYmFja31cblx0XHR7cGFyZW50PW51bGwsIHBvcz1udWxsLCBxdWF0PW51bGwsIHNjYWxlPW51bGwsIG1hdHJpeD1udWxsLCBkdXJhdGlvbj02MDAsIGNhbGxiYWNrPSgpPT57fX0pXG5cdHtcblx0XHRzdXBlcignQW5pbWF0ZScpO1xuXHRcdFxuXHRcdGlmKG1hdHJpeClcblx0XHR7XG5cdFx0XHQvLyBleHRyYWN0IHBvc2l0aW9uL3JvdGF0aW9uL3NjYWxlIGZyb20gbWF0cml4XG5cdFx0XHRwb3MgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXHRcdFx0cXVhdCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cdFx0XHRzY2FsZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cdFx0XHRtYXRyaXguZGVjb21wb3NlKHBvcywgcXVhdCwgc2NhbGUpO1xuXHRcdH1cblxuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge3BhcmVudCwgcG9zLCBxdWF0LCBzY2FsZSwgZHVyYXRpb24sIGNhbGxiYWNrfSk7XG5cdH1cblxuXHRhd2FrZShvYmopXG5cdHtcblx0XHRzdXBlci5hd2FrZShvYmopO1xuXG5cdFx0Ly8gc2h1ZmZsZSBoaWVyYXJjaHksIGJ1dCBrZWVwIHdvcmxkIHRyYW5zZm9ybSB0aGUgc2FtZVxuXHRcdGlmKHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50ICE9PSBvYmoucGFyZW50KVxuXHRcdHtcblx0XHRcdG9iai5hcHBseU1hdHJpeChvYmoucGFyZW50Lm1hdHJpeFdvcmxkKTtcblx0XHRcdGxldCBtYXQgPSBuZXcgVEhSRUUuTWF0cml4NCgpLmdldEludmVyc2UodGhpcy5wYXJlbnQubWF0cml4V29ybGQpO1xuXHRcdFx0b2JqLmFwcGx5TWF0cml4KG1hdCk7XG5cblx0XHRcdHRoaXMucGFyZW50LmFkZChvYmopO1xuXHRcdH1cblxuXHRcdC8vIHJlYWQgaW5pdGlhbCBwb3NpdGlvbnNcblx0XHR0aGlzLmluaXRpYWxQb3MgPSBvYmoucG9zaXRpb24uY2xvbmUoKTtcblx0XHR0aGlzLmluaXRpYWxRdWF0ID0gb2JqLnF1YXRlcm5pb24uY2xvbmUoKTtcblx0XHR0aGlzLmluaXRpYWxTY2FsZSA9IG9iai5zY2FsZS5jbG9uZSgpO1xuXHRcdHRoaXMuc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblx0fVxuXG5cdHVwZGF0ZSgpXG5cdHtcblx0XHQvLyBjb21wdXRlIGVhc2Utb3V0IGJhc2VkIG9uIGR1cmF0aW9uXG5cdFx0bGV0IG1peCA9IChEYXRlLm5vdygpLXRoaXMuc3RhcnRUaW1lKSAvIHRoaXMuZHVyYXRpb247XG5cdFx0bGV0IGVhc2UgPSBUV0VFTiA/IFRXRUVOLkVhc2luZy5RdWFkcmF0aWMuT3V0IDogbiA9PiBuKigyLW4pO1xuXHRcdG1peCA9IG1peCA8IDEgPyBlYXNlKG1peCkgOiAxO1xuXG5cdFx0Ly8gYW5pbWF0ZSBwb3NpdGlvbiBpZiByZXF1ZXN0ZWRcblx0XHRpZiggdGhpcy5wb3MgKXtcblx0XHRcdHRoaXMub2JqZWN0M0QucG9zaXRpb24ubGVycFZlY3RvcnModGhpcy5pbml0aWFsUG9zLCB0aGlzLnBvcywgbWl4KTtcblx0XHR9XG5cblx0XHQvLyBhbmltYXRlIHJvdGF0aW9uIGlmIHJlcXVlc3RlZFxuXHRcdGlmKCB0aGlzLnF1YXQgKXtcblx0XHRcdFRIUkVFLlF1YXRlcm5pb24uc2xlcnAodGhpcy5pbml0aWFsUXVhdCwgdGhpcy5xdWF0LCB0aGlzLm9iamVjdDNELnF1YXRlcm5pb24sIG1peClcblx0XHR9XG5cblx0XHQvLyBhbmltYXRlIHNjYWxlIGlmIHJlcXVlc3RlZFxuXHRcdGlmKCB0aGlzLnNjYWxlICl7XG5cdFx0XHR0aGlzLm9iamVjdDNELnNjYWxlLmxlcnBWZWN0b3JzKHRoaXMuaW5pdGlhbFNjYWxlLCB0aGlzLnNjYWxlLCBtaXgpO1xuXHRcdH1cblxuXHRcdC8vIHRlcm1pbmF0ZSBhbmltYXRpb24gd2hlbiBkb25lXG5cdFx0aWYobWl4ID49IDEpe1xuXHRcdFx0dGhpcy5vYmplY3QzRC5yZW1vdmVCZWhhdmlvcih0aGlzKTtcblx0XHRcdHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLm9iamVjdDNEKTtcblx0XHR9XG5cdH1cbn1cblxuQW5pbWF0ZS5zdGFydCA9ICh0YXJnZXQsIG9wdHMpID0+XG57XG5cdGxldCBvbGRBbmltID0gdGFyZ2V0LmdldEJlaGF2aW9yQnlUeXBlKCdBbmltYXRlJyk7XG5cdGlmKG9sZEFuaW0pe1xuXHRcdG9sZEFuaW0uY29uc3RydWN0b3Iob3B0cyk7XG5cdFx0b2xkQW5pbS5hd2FrZSh0YXJnZXQpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHRhcmdldC5hZGRCZWhhdmlvciggbmV3IEFuaW1hdGUob3B0cykgKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBbmltYXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQXNzZXRNYW5hZ2VyIGZyb20gJy4vYXNzZXRzJztcbmltcG9ydCBBbmltYXRlIGZyb20gJy4vYW5pbWF0ZSc7XG5cbi8vIGVudW0gY29uc3RhbnRzXG5sZXQgVHlwZXMgPSBPYmplY3QuZnJlZXplKHtcblx0UE9MSUNZX0xJQkVSQUw6IDAsXG5cdFBPTElDWV9GQVNDSVNUOiAxLFxuXHRST0xFX0xJQkVSQUw6IDIsXG5cdFJPTEVfRkFTQ0lTVDogMyxcblx0Uk9MRV9ISVRMRVI6IDQsXG5cdFBBUlRZX0xJQkVSQUw6IDUsXG5cdFBBUlRZX0ZBU0NJU1Q6IDYsXG5cdEpBOiA3LFxuXHRORUlOOiA4LFxuXHRCTEFOSzogOVxufSk7XG5cbmZ1bmN0aW9uIGRpbXNUb1VWKHtzaWRlLCBsZWZ0LCByaWdodCwgdG9wLCBib3R0b219KVxue1xuXHRpZihzaWRlKVxuXHRcdHJldHVybiBbW1xuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIodG9wLCBsZWZ0KSxcblx0XHRcdG5ldyBUSFJFRS5WZWN0b3IyKGJvdHRvbSwgbGVmdCksXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMih0b3AsIHJpZ2h0KVxuXHRcdF0sW1xuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIoYm90dG9tLCBsZWZ0KSxcblx0XHRcdG5ldyBUSFJFRS5WZWN0b3IyKGJvdHRvbSwgcmlnaHQpLFxuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIodG9wLCByaWdodClcblx0XHRdXTtcblx0ZWxzZVxuXHRcdHJldHVybiBbW1xuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIobGVmdCwgdG9wKSxcblx0XHRcdG5ldyBUSFJFRS5WZWN0b3IyKGxlZnQsIGJvdHRvbSksXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMihyaWdodCwgdG9wKVxuXHRcdF0sW1xuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIobGVmdCwgYm90dG9tKSxcblx0XHRcdG5ldyBUSFJFRS5WZWN0b3IyKHJpZ2h0LCBib3R0b20pLFxuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIocmlnaHQsIHRvcClcblx0XHRdXTtcbn1cblxuZnVuY3Rpb24gZ2V0VVZzKHR5cGUpXG57XG5cdGxldCBkaW1zID0ge2xlZnQ6IDAsIHJpZ2h0OiAxLCBib3R0b206IDAsIHRvcDogMX07XG5cblx0c3dpdGNoKHR5cGUpXG5cdHtcblx0Y2FzZSBUeXBlcy5QT0xJQ1lfTElCRVJBTDpcblx0XHRkaW1zID0ge3NpZGU6IHRydWUsIGxlZnQ6IDAuODM0LCByaWdodDogMC45OTYsIHRvcDogMC43NTQsIGJvdHRvbTogMC45OTd9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLlBPTElDWV9GQVNDSVNUOlxuXHRcdGRpbXMgPSB7c2lkZTogdHJ1ZSwgbGVmdDogMC42NiwgcmlnaHQ6IDAuODIyLCB0b3A6IDAuNzU0LCBib3R0b206IDAuOTk2fTtcblx0XHRicmVhaztcblx0Y2FzZSBUeXBlcy5ST0xFX0xJQkVSQUw6XG5cdFx0ZGltcyA9IHtsZWZ0OiAwLjUwNSwgcmlnaHQ6IDAuNzQ2LCB0b3A6IDAuOTk2LCBib3R0b206IDAuNjV9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLlJPTEVfRkFTQ0lTVDpcblx0XHRkaW1zID0ge2xlZnQ6IDAuNTA1LCByaWdodDogMC43NDYsIHRvcDogMC42NDUsIGJvdHRvbTogMC4zfTtcblx0XHRicmVhaztcblx0Y2FzZSBUeXBlcy5ST0xFX0hJVExFUjpcblx0XHRkaW1zID0ge2xlZnQ6IDAuNzU0LCByaWdodDogMC45OTYsIHRvcDogMC42NDUsIGJvdHRvbTogMC4zfTtcblx0XHRicmVhaztcblx0Y2FzZSBUeXBlcy5QQVJUWV9MSUJFUkFMOlxuXHRcdGRpbXMgPSB7bGVmdDogMC4yNTUsIHJpZ2h0OiAwLjQ5NSwgdG9wOiAwLjk5NiwgYm90dG9tOiAwLjY1fTtcblx0XHRicmVhaztcblx0Y2FzZSBUeXBlcy5QQVJUWV9GQVNDSVNUOlxuXHRcdGRpbXMgPSB7bGVmdDogMC4yNTUsIHJpZ2h0OiAwLjQ5NSwgdG9wOiAwLjY0NSwgYm90dG9tOiAwLjN9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLkpBOlxuXHRcdGRpbXMgPSB7bGVmdDogMC4wMDUsIHJpZ2h0OiAwLjI0NCwgdG9wOiAwLjk5MiwgYm90dG9tOiAwLjY1M307XG5cdFx0YnJlYWs7XG5cdGNhc2UgVHlwZXMuTkVJTjpcblx0XHRkaW1zID0ge2xlZnQ6IDAuMDA2LCByaWdodDogMC4yNDMsIHRvcDogMC42NDIsIGJvdHRvbTogMC4zMDJ9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLkJMQU5LOlxuXHRkZWZhdWx0OlxuXHRcdGRpbXMgPSB7c2lkZTogdHJ1ZSwgbGVmdDogMC4wMjIsIHJpZ2h0OiAuMDIyKzAuMjQ3LCB0b3A6IDAuMDIxLCBib3R0b206IC4wMjErMC4zNTQzfTtcblx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBkaW1zVG9VVihkaW1zKTtcbn1cblxuXG5jbGFzcyBDYXJkIGV4dGVuZHMgVEhSRUUuT2JqZWN0M0Rcbntcblx0Y29uc3RydWN0b3IodHlwZSA9IFR5cGVzLkJMQU5LLCBkb3VibGVTaWRlZCA9IHRydWUsIHNlY3JldCA9IGZhbHNlKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdC8vIGNyZWF0ZSB0aGUgY2FyZCBmYWNlc1xuXHRcdGxldCBmcm9udCA9IG5ldyBUSFJFRS5NZXNoKFxuXHRcdFx0bmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoLjM1NzUsIC41KSxcblx0XHRcdG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7bWFwOiBBc3NldE1hbmFnZXIuY2FjaGUudGV4dHVyZXMuY2FyZHN9KVxuXHRcdCk7XG5cdFx0bGV0IGJhY2sgPSBuZXcgVEhSRUUuTWVzaChcblx0XHRcdG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KC4zNTc1LCAuNSksXG5cdFx0XHRuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe21hcDogQXNzZXRNYW5hZ2VyLmNhY2hlLnRleHR1cmVzLmNhcmRzfSlcblx0XHQpO1xuXHRcdGJhY2sucG9zaXRpb24uc2V0KDAuMDA1LCAwLCAwKTtcblx0XHRiYWNrLnJvdGF0ZVkoTWF0aC5QSSk7XG5cblx0XHQvLyBzZXQgdGhlIGZhY2VzIHRvIHRoZSBjb3JyZWN0IHBhcnQgb2YgdGhlIHRleHR1cmVcblx0XHRmcm9udC5nZW9tZXRyeS5mYWNlVmVydGV4VXZzID0gW2dldFVWcyh0eXBlKV07XG5cdFx0YmFjay5nZW9tZXRyeS5mYWNlVmVydGV4VXZzID0gW2dldFVWcyggZG91YmxlU2lkZWQgPyB0eXBlIDogVHlwZXMuQkxBTksgKV07XG5cblx0XHR3aW5kb3cudGVzdCA9IGZyb250O1xuXG5cdFx0dGhpcy5hZGQoZnJvbnQsIGJhY2spO1xuXHR9XG5cbn1cblxuY2xhc3MgTGliZXJhbFBvbGljeUNhcmQgZXh0ZW5kcyBDYXJkIHtcblx0Y29uc3RydWN0b3Ioc2VjcmV0ID0gZmFsc2Upe1xuXHRcdHN1cGVyKFR5cGVzLlBPTElDWV9MSUJFUkFMLCBmYWxzZSwgc2VjcmV0KTtcblx0fVxuXHRnb1RvUG9zaXRpb24oc3BvdCA9IDApXG5cdHtcblx0XHRzcG90ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oNCwgc3BvdCkpO1xuXHRcdGxldCBzID0gTGliZXJhbFBvbGljeUNhcmQuc3BvdHM7XG5cdFx0QW5pbWF0ZS5zdGFydCh0aGlzLCB7cGFyZW50OiBBc3NldE1hbmFnZXIucm9vdCwgcG9zOiBzWydwb3NfJytzcG90XSwgcXVhdDogcy5xdWF0LCBzY2FsZTogcy5zY2FsZX0pO1xuXHR9XG59XG5cbkxpYmVyYWxQb2xpY3lDYXJkLnNwb3RzID0ge1xuXHRwb3NfMDogbmV3IFRIUkVFLlZlY3RvcjMoMC41MzMsIDAuNzYsIC0wLjMzNiksXG5cdHBvc18xOiBuZXcgVEhSRUUuVmVjdG9yMygwLjI2MywgMC43NiwgLTAuMzM2KSxcblx0cG9zXzI6IG5ldyBUSFJFRS5WZWN0b3IzKC0uMDA3LCAwLjc2LCAtMC4zMzYpLFxuXHRwb3NfMzogbmV3IFRIUkVFLlZlY3RvcjMoLS4yNzksIDAuNzYsIC0wLjMzNiksXG5cdHBvc180OiBuZXcgVEhSRUUuVmVjdG9yMygtLjU1MiwgMC43NiwgLTAuMzM2KSxcblx0cXVhdDogbmV3IFRIUkVFLlF1YXRlcm5pb24oMCwgMC43MDcxMDY3ODExODY1NDc1LCAwLjcwNzEwNjc4MTE4NjU0NzUsIDApLFxuXHRzY2FsZTogbmV3IFRIUkVFLlZlY3RvcjMoMC43LCAwLjcsIDAuNylcbn1cblxuY2xhc3MgRmFzY2lzdFBvbGljeUNhcmQgZXh0ZW5kcyBDYXJkIHtcblx0Y29uc3RydWN0b3Ioc2VjcmV0ID0gZmFsc2Upe1xuXHRcdHN1cGVyKFR5cGVzLlBPTElDWV9GQVNDSVNULCBmYWxzZSwgc2VjcmV0KTtcblx0fVxuXHRnb1RvUG9zaXRpb24oc3BvdCA9IDApXG5cdHtcblx0XHRzcG90ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oNSwgc3BvdCkpO1xuXHRcdGxldCBzID0gRmFzY2lzdFBvbGljeUNhcmQuc3BvdHM7XG5cdFx0QW5pbWF0ZS5zdGFydCh0aGlzLCB7cGFyZW50OiBBc3NldE1hbmFnZXIucm9vdCwgcG9zOiBzWydwb3NfJytzcG90XSwgcXVhdDogcy5xdWF0LCBzY2FsZTogcy5zY2FsZX0pO1xuXHR9XG59XG5cbkZhc2Npc3RQb2xpY3lDYXJkLnNwb3RzID0ge1xuXHRwb3NfMDogbmV3IFRIUkVFLlZlY3RvcjMoLS42ODcsIDAuNzYsIDAuMzQxKSxcblx0cG9zXzE6IG5ldyBUSFJFRS5WZWN0b3IzKC0uNDE3LCAwLjc2LCAwLjM0MSksXG5cdHBvc18yOiBuZXcgVEhSRUUuVmVjdG9yMygtLjE0NiwgMC43NiwgMC4zNDEpLFxuXHRwb3NfMzogbmV3IFRIUkVFLlZlY3RvcjMoMC4xMjcsIDAuNzYsIDAuMzQxKSxcblx0cG9zXzQ6IG5ldyBUSFJFRS5WZWN0b3IzKDAuNDAwLCAwLjc2LCAwLjM0MSksXG5cdHBvc181OiBuZXcgVEhSRUUuVmVjdG9yMygwLjY3MywgMC43NiwgMC4zNDEpLFxuXHRxdWF0OiBuZXcgVEhSRUUuUXVhdGVybmlvbigtMC43MDcxMDY3ODExODY1NDc1LCAwLCAwLCAwLjcwNzEwNjc4MTE4NjU0NzUpLFxuXHRzY2FsZTogbmV3IFRIUkVFLlZlY3RvcjMoMC43LCAwLjcsIDAuNylcbn1cblxuY2xhc3MgTGliZXJhbFJvbGVDYXJkIGV4dGVuZHMgQ2FyZCB7XG5cdGNvbnN0cnVjdG9yKHNlY3JldCA9IGZhbHNlKXtcblx0XHRzdXBlcihUeXBlcy5ST0xFX0xJQkVSQUwsIGZhbHNlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIEZhc2Npc3RSb2xlQ2FyZCBleHRlbmRzIENhcmQge1xuXHRjb25zdHJ1Y3RvcihzZWNyZXQgPSBmYWxzZSl7XG5cdFx0c3VwZXIoVHlwZXMuUk9MRV9GQVNDSVNULCBmYWxzZSwgc2VjcmV0KTtcblx0fVxufVxuXG5jbGFzcyBIaXRsZXJSb2xlQ2FyZCBleHRlbmRzIENhcmQge1xuXHRjb25zdHJ1Y3RvcihzZWNyZXQgPSBmYWxzZSl7XG5cdFx0c3VwZXIoVHlwZXMuUk9MRV9ISVRMRVIsIGZhbHNlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIExpYmVyYWxQYXJ0eUNhcmQgZXh0ZW5kcyBDYXJkIHtcblx0Y29uc3RydWN0b3Ioc2VjcmV0ID0gZmFsc2Upe1xuXHRcdHN1cGVyKFR5cGVzLlBBUlRZX0xJQkVSQUwsIGZhbHNlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIEZhc2Npc3RQYXJ0eUNhcmQgZXh0ZW5kcyBDYXJkIHtcblx0Y29uc3RydWN0b3Ioc2VjcmV0ID0gZmFsc2Upe1xuXHRcdHN1cGVyKFR5cGVzLlBBUlRZX0ZBU0NJU1QsIGZhbHNlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIEphQ2FyZCBleHRlbmRzIENhcmQge1xuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHN1cGVyKFR5cGVzLkpBLCBmYWxzZSwgZmFsc2UpO1xuXHRcdHRoaXMuY2hpbGRyZW5bMF0ucm90YXRlWigtTWF0aC5QSS8yKTtcblx0XHR0aGlzLmNoaWxkcmVuWzFdLnJvdGF0ZVooLU1hdGguUEkvMik7XG5cdH1cbn1cblxuY2xhc3MgTmVpbkNhcmQgZXh0ZW5kcyBDYXJkIHtcblx0Y29uc3RydWN0b3IoKXtcblx0XHRzdXBlcihUeXBlcy5ORUlOLCBmYWxzZSwgZmFsc2UpO1xuXHRcdHRoaXMuY2hpbGRyZW5bMF0ucm90YXRlWigtTWF0aC5QSS8yKTtcblx0XHR0aGlzLmNoaWxkcmVuWzFdLnJvdGF0ZVooLU1hdGguUEkvMik7XG5cdH1cbn1cblxuXG5leHBvcnQge1xuXHRDYXJkLCBUeXBlcyxcblx0TGliZXJhbFBvbGljeUNhcmQsIEZhc2Npc3RQb2xpY3lDYXJkLCBMaWJlcmFsUm9sZUNhcmQsIEZhc2Npc3RSb2xlQ2FyZCxcblx0SGl0bGVyUm9sZUNhcmQsIExpYmVyYWxQYXJ0eUNhcmQsIEZhc2Npc3RQYXJ0eUNhcmQsIEphQ2FyZCwgTmVpbkNhcmRcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCAqIGFzIENhcmRzIGZyb20gJy4vY2FyZCc7XG5pbXBvcnQgQXNzZXRNYW5hZ2VyIGZyb20gJy4vYXNzZXRzJztcblxuZXhwb3J0IGRlZmF1bHQgLy9TZWNyZXRIaXRsZXJcbntcblx0YXNzZXRzOiBBc3NldE1hbmFnZXIubWFuaWZlc3QsXG5cdHZlcnRpY2FsQWxpZ246ICdib3R0b20nLFxuXHRpbml0aWFsaXplOiAoZW52LCByb290LCBhc3NldHMpID0+IHtcblxuXHRcdC8vIHBvcHVsYXRlIHRoZSBzaGFyZWQgYXNzZXQgY2FjaGVcblx0XHRBc3NldE1hbmFnZXIuY2FjaGUgPSBhc3NldHM7XG5cdFx0QXNzZXRNYW5hZ2VyLnJvb3QgPSByb290O1xuXG5cdFx0Ly8gY3JlYXRlIHRoZSB0YWJsZVxuXHRcdGxldCB0YWJsZSA9IGFzc2V0cy5tb2RlbHMuYm9hcmQ7XG5cdFx0bGV0IG1hdCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogYXNzZXRzLnRleHR1cmVzLmJvYXJkX2xhcmdlIH0pO1xuXHRcdHRhYmxlLmNoaWxkcmVuWzBdLm1hdGVyaWFsID0gbWF0O1xuXHRcdHRhYmxlLnJvdGF0aW9uLnNldCgtTWF0aC5QSS8yLCAwLCAwKTtcblx0XHR0YWJsZS5wb3NpdGlvbi5zZXQoMCwgMC43NSwgMCk7XG5cdFx0cm9vdC5hZGQodGFibGUpO1xuXG5cdFx0Ly8gY3JlYXRlIHRlc3QgY2FyZFxuXHRcdGxldCBjID0gbmV3IENhcmRzLkZhc2Npc3RQb2xpY3lDYXJkKCk7XG5cdFx0Yy50cmFuc2xhdGVZKDEuMyk7XG5cdFx0cm9vdC5hZGQoYyk7XG5cblx0XHRsZXQgaGF0ID0gYXNzZXRzLm1vZGVscy50b3BoYXQ7XG5cdFx0aGF0LnBvc2l0aW9uLnNldCgwLjUsIDEuMywgMCk7XG5cdFx0aGF0LnJvdGF0aW9uLnNldCgtTWF0aC5QSS8yLCAwLCAwKTtcblx0XHRyb290LmFkZChoYXQpO1xuXHRcdFxuXHRcdGxldCBoYXQyID0gYXNzZXRzLm1vZGVscy52aXNvcmNhcDtcblx0XHRoYXQyLnBvc2l0aW9uLnNldCgtMC41LCAxLjMsIDApO1xuXHRcdGhhdDIucm90YXRpb24uc2V0KC1NYXRoLlBJLzIsIDAsIDApO1xuXHRcdHJvb3QuYWRkKGhhdDIpO1xuXHR9XG59XG5cbiJdLCJuYW1lcyI6WyJzdXBlciIsImxldCIsIkNhcmRzLkZhc2Npc3RQb2xpY3lDYXJkIl0sIm1hcHBp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

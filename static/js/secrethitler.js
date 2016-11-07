var SecretHitler = (function () {
'use strict';

var AssetManager = { 
	manifest: {
		models: {
			board: 'model/table.dae'
		},
		textures: {
			board_large: 'img/board-large-baked.png',
			board_med: 'img/board-medium-baked.png',
			board_small: 'img/board-small-baked.png',
			cards: 'img/cards.png'
		}
	},
	cache: {}
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
	}

	console.log(dims);
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

var NeinCard = (function (Card) {
	function NeinCard(){
		Card.call(this, Types.NEIN, true, false);
		this.children[0].rotateZ(-Math.PI/2);
		this.children[1].rotateZ(-Math.PI/2);
	}

	if ( Card ) NeinCard.__proto__ = Card;
	NeinCard.prototype = Object.create( Card && Card.prototype );
	NeinCard.prototype.constructor = NeinCard;

	return NeinCard;
}(Card));

var secrethitler = {
	assets: AssetManager.manifest,
	initialize: function (env, root, assets) {

		// set root to the tabletop (1m from floor)
		var halfHeight = env.innerHeight/(2*env.pixelsPerMeter);
		root.position.setY(-halfHeight);

		// populate the shared asset cache
		AssetManager.cache = assets;

		// create the table
		var table = assets.models.board;
		var mat = new THREE.MeshBasicMaterial({ map: assets.textures.board_large });
		table.children[0].material = mat;
		table.rotation.set(-Math.PI/2, 0, 0);
		table.position.set(0, 1, 0);
		root.add(table);

		// create test card
		var c = new NeinCard();
		c.translateY(1.3);
		root.add(c);
	},

};

return secrethitler;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hc3NldHMuanMiLCIuLi8uLi9zcmMvY2FyZC5qcyIsIi4uLy4uL3NyYy9zZWNyZXRoaXRsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgZGVmYXVsdCB7IFxuXHRtYW5pZmVzdDoge1xuXHRcdG1vZGVsczoge1xuXHRcdFx0Ym9hcmQ6ICdtb2RlbC90YWJsZS5kYWUnXG5cdFx0fSxcblx0XHR0ZXh0dXJlczoge1xuXHRcdFx0Ym9hcmRfbGFyZ2U6ICdpbWcvYm9hcmQtbGFyZ2UtYmFrZWQucG5nJyxcblx0XHRcdGJvYXJkX21lZDogJ2ltZy9ib2FyZC1tZWRpdW0tYmFrZWQucG5nJyxcblx0XHRcdGJvYXJkX3NtYWxsOiAnaW1nL2JvYXJkLXNtYWxsLWJha2VkLnBuZycsXG5cdFx0XHRjYXJkczogJ2ltZy9jYXJkcy5wbmcnXG5cdFx0fVxuXHR9LFxuXHRjYWNoZToge31cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEFzc2V0TWFuYWdlciBmcm9tICcuL2Fzc2V0cyc7XG5cblx0Ly8gZW51bSBjb25zdGFudHNcbmxldCBUeXBlcyA9IE9iamVjdC5mcmVlemUoe1xuXHRQT0xJQ1lfTElCRVJBTDogMCxcblx0UE9MSUNZX0ZBU0NJU1Q6IDEsXG5cdFJPTEVfTElCRVJBTDogMixcblx0Uk9MRV9GQVNDSVNUOiAzLFxuXHRST0xFX0hJVExFUjogNCxcblx0UEFSVFlfTElCRVJBTDogNSxcblx0UEFSVFlfRkFTQ0lTVDogNixcblx0SkE6IDcsXG5cdE5FSU46IDgsXG5cdEJMQU5LOiA5XG59KTtcblxuZnVuY3Rpb24gZGltc1RvVVYoe3NpZGUsIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbX0pXG57XG5cdGlmKHNpZGUpXG5cdFx0cmV0dXJuIFtbXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMih0b3AsIGxlZnQpLFxuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIoYm90dG9tLCBsZWZ0KSxcblx0XHRcdG5ldyBUSFJFRS5WZWN0b3IyKHRvcCwgcmlnaHQpXG5cdFx0XSxbXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMihib3R0b20sIGxlZnQpLFxuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIoYm90dG9tLCByaWdodCksXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMih0b3AsIHJpZ2h0KVxuXHRcdF1dO1xuXHRlbHNlXG5cdFx0cmV0dXJuIFtbXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMihsZWZ0LCB0b3ApLFxuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIobGVmdCwgYm90dG9tKSxcblx0XHRcdG5ldyBUSFJFRS5WZWN0b3IyKHJpZ2h0LCB0b3ApXG5cdFx0XSxbXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMihsZWZ0LCBib3R0b20pLFxuXHRcdFx0bmV3IFRIUkVFLlZlY3RvcjIocmlnaHQsIGJvdHRvbSksXG5cdFx0XHRuZXcgVEhSRUUuVmVjdG9yMihyaWdodCwgdG9wKVxuXHRcdF1dO1xufVxuXG5mdW5jdGlvbiBnZXRVVnModHlwZSlcbntcblx0bGV0IGRpbXMgPSB7bGVmdDogMCwgcmlnaHQ6IDEsIGJvdHRvbTogMCwgdG9wOiAxfTtcblxuXHRzd2l0Y2godHlwZSlcblx0e1xuXHRjYXNlIFR5cGVzLlBPTElDWV9MSUJFUkFMOlxuXHRcdGRpbXMgPSB7c2lkZTogdHJ1ZSwgbGVmdDogMC44MzQsIHJpZ2h0OiAwLjk5NiwgdG9wOiAwLjc1NCwgYm90dG9tOiAwLjk5N307XG5cdFx0YnJlYWs7XG5cdGNhc2UgVHlwZXMuUE9MSUNZX0ZBU0NJU1Q6XG5cdFx0ZGltcyA9IHtzaWRlOiB0cnVlLCBsZWZ0OiAwLjY2LCByaWdodDogMC44MjIsIHRvcDogMC43NTQsIGJvdHRvbTogMC45OTZ9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLlJPTEVfTElCRVJBTDpcblx0XHRkaW1zID0ge2xlZnQ6IDAuNTA1LCByaWdodDogMC43NDYsIHRvcDogMC45OTYsIGJvdHRvbTogMC42NX07XG5cdFx0YnJlYWs7XG5cdGNhc2UgVHlwZXMuUk9MRV9GQVNDSVNUOlxuXHRcdGRpbXMgPSB7bGVmdDogMC41MDUsIHJpZ2h0OiAwLjc0NiwgdG9wOiAwLjY0NSwgYm90dG9tOiAwLjN9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLlJPTEVfSElUTEVSOlxuXHRcdGRpbXMgPSB7bGVmdDogMC43NTQsIHJpZ2h0OiAwLjk5NiwgdG9wOiAwLjY0NSwgYm90dG9tOiAwLjN9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLlBBUlRZX0xJQkVSQUw6XG5cdFx0ZGltcyA9IHtsZWZ0OiAwLjI1NSwgcmlnaHQ6IDAuNDk1LCB0b3A6IDAuOTk2LCBib3R0b206IDAuNjV9O1xuXHRcdGJyZWFrO1xuXHRjYXNlIFR5cGVzLlBBUlRZX0ZBU0NJU1Q6XG5cdFx0ZGltcyA9IHtsZWZ0OiAwLjI1NSwgcmlnaHQ6IDAuNDk1LCB0b3A6IDAuNjQ1LCBib3R0b206IDAuM307XG5cdFx0YnJlYWs7XG5cdGNhc2UgVHlwZXMuSkE6XG5cdFx0ZGltcyA9IHtsZWZ0OiAwLjAwNSwgcmlnaHQ6IDAuMjQ0LCB0b3A6IDAuOTkyLCBib3R0b206IDAuNjUzfTtcblx0XHRicmVhaztcblx0Y2FzZSBUeXBlcy5ORUlOOlxuXHRcdGRpbXMgPSB7bGVmdDogMC4wMDYsIHJpZ2h0OiAwLjI0MywgdG9wOiAwLjY0MiwgYm90dG9tOiAwLjMwMn07XG5cdFx0YnJlYWs7XG5cdGNhc2UgVHlwZXMuQkxBTks6XG5cdGRlZmF1bHQ6XG5cdH1cblxuXHRjb25zb2xlLmxvZyhkaW1zKTtcblx0cmV0dXJuIGRpbXNUb1VWKGRpbXMpO1xufVxuXG5cbmNsYXNzIENhcmQgZXh0ZW5kcyBUSFJFRS5PYmplY3QzRFxue1xuXHRjb25zdHJ1Y3Rvcih0eXBlID0gVHlwZXMuQkxBTkssIGRvdWJsZVNpZGVkID0gdHJ1ZSwgc2VjcmV0ID0gZmFsc2UpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0Ly8gY3JlYXRlIHRoZSBjYXJkIGZhY2VzXG5cdFx0bGV0IGZyb250ID0gbmV3IFRIUkVFLk1lc2goXG5cdFx0XHRuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSguMzU3NSwgLjUpLFxuXHRcdFx0bmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHttYXA6IEFzc2V0TWFuYWdlci5jYWNoZS50ZXh0dXJlcy5jYXJkc30pXG5cdFx0KTtcblx0XHRsZXQgYmFjayA9IG5ldyBUSFJFRS5NZXNoKFxuXHRcdFx0bmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoLjM1NzUsIC41KSxcblx0XHRcdG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7bWFwOiBBc3NldE1hbmFnZXIuY2FjaGUudGV4dHVyZXMuY2FyZHN9KVxuXHRcdCk7XG5cdFx0YmFjay5wb3NpdGlvbi5zZXQoMC4wMDUsIDAsIDApO1xuXHRcdGJhY2sucm90YXRlWShNYXRoLlBJKTtcblxuXHRcdC8vIHNldCB0aGUgZmFjZXMgdG8gdGhlIGNvcnJlY3QgcGFydCBvZiB0aGUgdGV4dHVyZVxuXHRcdGZyb250Lmdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnMgPSBbZ2V0VVZzKHR5cGUpXTtcblx0XHRiYWNrLmdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnMgPSBbZ2V0VVZzKCBkb3VibGVTaWRlZCA/IHR5cGUgOiBUeXBlcy5CTEFOSyApXTtcblxuXHRcdHdpbmRvdy50ZXN0ID0gZnJvbnQ7XG5cblx0XHR0aGlzLmFkZChmcm9udCwgYmFjayk7XG5cdH1cblxufVxuXG5jbGFzcyBMaWJlcmFsUG9saWN5Q2FyZCBleHRlbmRzIENhcmQge1xuXHRjb25zdHJ1Y3RvcihzZWNyZXQgPSBmYWxzZSl7XG5cdFx0c3VwZXIoVHlwZXMuUE9MSUNZX0xJQkVSQUwsIHRydWUsIHNlY3JldCk7XG5cdH1cbn1cblxuY2xhc3MgRmFzY2lzdFBvbGljeUNhcmQgZXh0ZW5kcyBDYXJkIHtcblx0Y29uc3RydWN0b3Ioc2VjcmV0ID0gZmFsc2Upe1xuXHRcdHN1cGVyKFR5cGVzLlBPTElDWV9GQVNDSVNULCB0cnVlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIExpYmVyYWxSb2xlQ2FyZCBleHRlbmRzIENhcmQge1xuXHRjb25zdHJ1Y3RvcihzZWNyZXQgPSBmYWxzZSl7XG5cdFx0c3VwZXIoVHlwZXMuUk9MRV9MSUJFUkFMLCB0cnVlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIEZhc2Npc3RSb2xlQ2FyZCBleHRlbmRzIENhcmQge1xuXHRjb25zdHJ1Y3RvcihzZWNyZXQgPSBmYWxzZSl7XG5cdFx0c3VwZXIoVHlwZXMuUk9MRV9GQVNDSVNULCB0cnVlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIEhpdGxlclJvbGVDYXJkIGV4dGVuZHMgQ2FyZCB7XG5cdGNvbnN0cnVjdG9yKHNlY3JldCA9IGZhbHNlKXtcblx0XHRzdXBlcihUeXBlcy5ST0xFX0hJVExFUiwgdHJ1ZSwgc2VjcmV0KTtcblx0fVxufVxuXG5jbGFzcyBMaWJlcmFsUGFydHlDYXJkIGV4dGVuZHMgQ2FyZCB7XG5cdGNvbnN0cnVjdG9yKHNlY3JldCA9IGZhbHNlKXtcblx0XHRzdXBlcihUeXBlcy5QQVJUWV9MSUJFUkFMLCB0cnVlLCBzZWNyZXQpO1xuXHR9XG59XG5cbmNsYXNzIEZhc2Npc3RQYXJ0eUNhcmQgZXh0ZW5kcyBDYXJkIHtcblx0Y29uc3RydWN0b3Ioc2VjcmV0ID0gZmFsc2Upe1xuXHRcdHN1cGVyKFR5cGVzLlBBUlRZX0ZBU0NJU1QsIHRydWUsIHNlY3JldCk7XG5cdH1cbn1cblxuY2xhc3MgSmFDYXJkIGV4dGVuZHMgQ2FyZCB7XG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0c3VwZXIoVHlwZXMuSkEsIHRydWUsIGZhbHNlKTtcblx0XHR0aGlzLmNoaWxkcmVuWzBdLnJvdGF0ZVooLU1hdGguUEkvMik7XG5cdFx0dGhpcy5jaGlsZHJlblsxXS5yb3RhdGVaKC1NYXRoLlBJLzIpO1xuXHR9XG59XG5cbmNsYXNzIE5laW5DYXJkIGV4dGVuZHMgQ2FyZCB7XG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0c3VwZXIoVHlwZXMuTkVJTiwgdHJ1ZSwgZmFsc2UpO1xuXHRcdHRoaXMuY2hpbGRyZW5bMF0ucm90YXRlWigtTWF0aC5QSS8yKTtcblx0XHR0aGlzLmNoaWxkcmVuWzFdLnJvdGF0ZVooLU1hdGguUEkvMik7XG5cdH1cbn1cblxuXG5leHBvcnQge1xuXHRDYXJkLCBUeXBlcyxcblx0TGliZXJhbFBvbGljeUNhcmQsIEZhc2Npc3RQb2xpY3lDYXJkLCBMaWJlcmFsUm9sZUNhcmQsIEZhc2Npc3RSb2xlQ2FyZCxcblx0SGl0bGVyUm9sZUNhcmQsIExpYmVyYWxQYXJ0eUNhcmQsIEZhc2Npc3RQYXJ0eUNhcmQsIEphQ2FyZCwgTmVpbkNhcmRcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCAqIGFzIENhcmRzIGZyb20gJy4vY2FyZCc7XG5pbXBvcnQgQXNzZXRNYW5hZ2VyIGZyb20gJy4vYXNzZXRzJztcblxuZXhwb3J0IGRlZmF1bHQgLy9TZWNyZXRIaXRsZXJcbntcblx0YXNzZXRzOiBBc3NldE1hbmFnZXIubWFuaWZlc3QsXG5cdGluaXRpYWxpemU6IChlbnYsIHJvb3QsIGFzc2V0cykgPT4ge1xuXG5cdFx0Ly8gc2V0IHJvb3QgdG8gdGhlIHRhYmxldG9wICgxbSBmcm9tIGZsb29yKVxuXHRcdGxldCBoYWxmSGVpZ2h0ID0gZW52LmlubmVySGVpZ2h0LygyKmVudi5waXhlbHNQZXJNZXRlcik7XG5cdFx0cm9vdC5wb3NpdGlvbi5zZXRZKC1oYWxmSGVpZ2h0KTtcblxuXHRcdC8vIHBvcHVsYXRlIHRoZSBzaGFyZWQgYXNzZXQgY2FjaGVcblx0XHRBc3NldE1hbmFnZXIuY2FjaGUgPSBhc3NldHM7XG5cblx0XHQvLyBjcmVhdGUgdGhlIHRhYmxlXG5cdFx0bGV0IHRhYmxlID0gYXNzZXRzLm1vZGVscy5ib2FyZDtcblx0XHRsZXQgbWF0ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiBhc3NldHMudGV4dHVyZXMuYm9hcmRfbGFyZ2UgfSk7XG5cdFx0dGFibGUuY2hpbGRyZW5bMF0ubWF0ZXJpYWwgPSBtYXQ7XG5cdFx0dGFibGUucm90YXRpb24uc2V0KC1NYXRoLlBJLzIsIDAsIDApO1xuXHRcdHRhYmxlLnBvc2l0aW9uLnNldCgwLCAxLCAwKTtcblx0XHRyb290LmFkZCh0YWJsZSk7XG5cblx0XHQvLyBjcmVhdGUgdGVzdCBjYXJkXG5cdFx0bGV0IGMgPSBuZXcgQ2FyZHMuTmVpbkNhcmQoKTtcblx0XHRjLnRyYW5zbGF0ZVkoMS4zKTtcblx0XHRyb290LmFkZChjKTtcblx0fSxcblxufVxuXG4iXSwibmFtZXMiOlsibGV0Iiwic3VwZXIiLCJDYXJkcy5OZWluQ2FyZCJdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsbUJBQWU7Q0FDZCxRQUFRLEVBQUU7RUFDVCxNQUFNLEVBQUU7R0FDUCxLQUFLLEVBQUUsaUJBQWlCO0dBQ3hCO0VBQ0QsUUFBUSxFQUFFO0dBQ1QsV0FBVyxFQUFFLDJCQUEyQjtHQUN4QyxTQUFTLEVBQUUsNEJBQTRCO0dBQ3ZDLFdBQVcsRUFBRSwyQkFBMkI7R0FDeEMsS0FBSyxFQUFFLGVBQWU7R0FDdEI7RUFDRDtDQUNELEtBQUssRUFBRSxFQUFFO0NBQ1QsQ0FBQTs7O0FDVkRBLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Q0FDekIsY0FBYyxFQUFFLENBQUM7Q0FDakIsY0FBYyxFQUFFLENBQUM7Q0FDakIsWUFBWSxFQUFFLENBQUM7Q0FDZixZQUFZLEVBQUUsQ0FBQztDQUNmLFdBQVcsRUFBRSxDQUFDO0NBQ2QsYUFBYSxFQUFFLENBQUM7Q0FDaEIsYUFBYSxFQUFFLENBQUM7Q0FDaEIsRUFBRSxFQUFFLENBQUM7Q0FDTCxJQUFJLEVBQUUsQ0FBQztDQUNQLEtBQUssRUFBRSxDQUFDO0NBQ1IsQ0FBQyxDQUFDOztBQUVILFNBQVMsUUFBUSxDQUFDLEdBQUE7QUFDbEI7S0FEbUIsSUFBSSxZQUFFO0tBQUEsSUFBSSxZQUFFO0tBQUEsS0FBSyxhQUFFO0tBQUEsR0FBRyxXQUFFO0tBQUEsTUFBTTs7Q0FFaEQsR0FBRyxJQUFJO0VBQ04sRUFBQSxPQUFPLENBQUM7R0FDUCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztHQUM1QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztHQUMvQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztHQUM3QixDQUFDO0dBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7R0FDL0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7R0FDaEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7R0FDN0IsQ0FBQyxDQUFDLEVBQUE7O0VBRUgsRUFBQSxPQUFPLENBQUM7R0FDUCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztHQUM1QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztHQUMvQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztHQUM3QixDQUFDO0dBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7R0FDL0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7R0FDaEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7R0FDN0IsQ0FBQyxDQUFDLEVBQUE7Q0FDSjs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxJQUFJO0FBQ3BCO0NBQ0NBLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOztDQUVsRCxPQUFPLElBQUk7O0NBRVgsS0FBSyxLQUFLLENBQUMsY0FBYztFQUN4QixJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxF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

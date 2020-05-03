var listener;

var runSound;
var walkSound;

const sounds_folder = '/static/sounds';

function initSounds() {
  listener = new THREE.AudioListener();
	runSound = new THREE.Audio(listener);
	walkSound = new THREE.Audio(listener);
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( sounds_folder + '/run.wav', function( buffer ) {
		runSound.setBuffer( buffer );
		runSound.setLoop( true );
		runSound.setVolume( 0.4 );
	});
	audioLoader.load( sounds_folder + '/walk2.wav', function( buffer ) {
		walkSound.setBuffer( buffer );
		walkSound.setLoop( true );
		walkSound.setVolume( 0.4 );
	});
}

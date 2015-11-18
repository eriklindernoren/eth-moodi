<?php
/**
 * Template Name: PDS JSON OUTPUT
 * No Sidebar, No Loop (for use as full screen Gallery with WP Supersized)
 *
 * Description: PDS JSON OUTPUT
 *
 * @package WordPress
 * @subpackage Twenty_Fourteen
 * @since Twenty Fourteen 1.0
 *
 */
?>

<?php

require_once ('TwitterAPIExchange.php');
require_once ('TwitterOauth.php');
$userId = "";
switch ($_GET['ptype']) {
	// Getting the user profile data
	case "users" :
		$userId = $_GET['userId'];
		$count = 50;
		$url = "https://api.twitter.com/1.1/statuses/user_timeline.json";
		$requestMethod = "GET";
		$getfield = "?screen_name=$userId&count=$count";
		$twitter = new TwitterAPIExchange($settings);
		$string = json_decode($twitter -> setGetfield($getfield) -> buildOauth($url, $requestMethod) -> performRequest(), $assoc = TRUE);

		// print_r($string);
		break;

	// curating the content
	case "curation" :
		if (!isset($_GET['test'])) {
			if (isset($_GET['zones'])) {
				$zones = $_GET['zones'];
			}
		} else {
			$zones = '{"zone1":["@BarackObama"],"zone2":["@Cristiano"],"zone3":["@britneyspears"]}';
		}
		$zones = (array) json_decode($zones);
		$string = $zones;

		// sample code

		// getting all the users without considering in which zone their are
		foreach ($zones as $zone) {
			foreach ($zone as $user) {
				// $user = str_replace("@", "", $user);
				// print_r ($user);
				if ($userId == "") {
					$userId = $user;
				} else {
					// part of the query
					// OR
					$userId = $userId . " OR " . $user;
					// AND
					// $userId =  $userId . "," .$user;
				}
			}
		}
		$userId = urlencode($userId);

		// getting users' recent posts
		$count = 7;
		$url = "https://api.twitter.com/1.1/search/tweets.json";
		$requestMethod = "GET";
		$getfield = "?q=$userId&count=$count";
		$twitter = new TwitterAPIExchange($settings);
		$string = json_decode($twitter -> setGetfield($getfield) -> buildOauth($url, $requestMethod) -> performRequest(), $assoc = TRUE);
		$string = $string['statuses'];
		//print_r($userId);
		break;

	default :
		return 0;
}

if ($string) {
	// Print => array 2 json
	print_r(json_encode($string));
}
?>

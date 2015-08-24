<?php

	$GLOBALS['cfg'] = array
	(
		// Data sources

		'data_sources' => array
		(
			'main' => array
			(
				'type'		=> 'mysql',
				'host'		=> 'localhost',
				'db'		=> 'mvtsprowbsgui',
				'user'		=> 'rtu',
				'password'	=> '##'
			),
			'remote' => array
			(
				'type'		=> 'mysql',
				'host'		=> '72.15.129.##',
				'db'		=> 'mvtsprowbs',
				'user'		=> 'rtu',
				'password'	=> '##'
			),
			'microsoft' => array
			(
				'type'		=> 'mssql',
				'host'		=> '72.15.129.##',
				'db'		=> 'wiztel',
				'user'		=> 'sa',
				'password'	=> '#####*'
			),
			'mvts' => array
			(
				'type'		=> 'mvts',
				'address'	=> '127.0.0.1:9000',
				'timeout'	=> 3
			)
		),

		'main_data_source' => 'main',
		'remote_data_source' => 'remote',
		'microsoft_data_source' => 'microsoft',
		// PHP settings

		'php' => array
		(
			// PHP session settings

			// PHP session id in cookies.
			// It should contain only alphanumeric characters;
			// it should be short and descriptive
			// (i.e. for users with enabled cookie warnings).

			'session_name' => 'mvtspro-php-sid',

			// The lifetime of session.
			// The number of seconds after which
			// data will be seen as 'garbage' and cleaned up.

			'session_lifetime' => 864000,

			// Probability (in percent) that the garbage collection
			// routine is started for expired sessions.

			'session_gc_probability' => 1,

			// Path where the PHP session files are created.

			'session_path' => 'session',

			// PHP error reporting.
			// E_NONE
			// E_ERROR
			// E_WARNING
			// E_PARSE
			// E_NOTICE
			// E_CORE_ERROR
			// E_CORE_WARNING
			// E_COMPILE_ERROR
			// E_COMPILE_WARNING
			// E_USER_ERROR
			// E_USER_WARNING
			// E_USER_NOTICE
			// E_ALL
			// E_STRICT

			'error_reporting' => E_ERROR
		),

		// Application settings

		'app' => array
		(
			// Web realm

			'realm_id' => 'users',

			// Differentiate windows in a session

			'differentiate_windows' => true,

			// Lifetime of window's session in seconds

			'windows_session_lifetime' => 864000,

			// Probability (in percent) that the garbage collection routine is started for window's session

			'windows_session_gc_probability' => 1,

			// Debug mode

			'debug' => true
		),
			'wbs' => array
		(
                       'tables' => array ('mvts_gateway','mvts_dialpeer'),
                       'wbstables' => array ('wbs_gateway','wbs_diapleer'),
		       'fields'  => array('Organization','vdsName','vdsType','vdsMobileCarrier','vdsDescription'),
		       'cgwfields'  => array(),
		       'orgfield' => 'Organization',
		       'custvalue' => '(select ID from wbs.x1customer where Accountstatus=\'Active\' and Organization=(trim(:Organization)))',
		       'orgvalue' => 'Organization = (trim(:Organization))',
		       'flag' => 'y',
                       'wbsbreak' => 'y',
		       'flagadd' => 'y',
			   'rights' => '?',
			   'usertype' => '?',
		       'gwtype' => '?',
			   'ajaxroot' => 'http://mvtswbs.wiztel.ca/',
		       'dpfields' => array('vdsName','vdsType','vdsMobileCarrier','vdsDescription') 
		 )   
	);

?>

#!/usr/bin/env bash
set -e

DB_CONFIG_FILE=./database/config/config.json
CMS_CONFIG_FILE=./scripts/core/cms_config_tests.json

USAGE="$0 -d <database> -u <user> -p <password>"

if [ -f $DB_CONFIG_FILE ]; then
	echo "$DB_CONFIG_FILE already exists!"
	exit 1
fi

if [ -f $CMS_CONFIG_FILE ]; then
	echo "$CMS_CONFIG_FILE already exists!"
	exit 1
fi

if [ $# != 6 ]; then
    echo "Wrong number of arguments: $# instead of 4"
	echo $USAGE
	exit 1
fi

while getopts ":d:u:p:" opt; do
	case $opt in
		d)
			DATABASE=$OPTARG
			;;
		u)
			USER=$OPTARG
			;;
	    p)
			PASSWORD=$OPTARG
			;;
		\?)
		    echo "Invalid option: -$OPTARG"
			echo $USAGE >&2
			exit 1
			;;
		:)
		    echo "Option -$OPTARG requires an argument."
			echo $USAGE >&2
			exit 1
			;;
	esac
done


npm install
echo "{ \"test\": {\"host\": \"localhost\", \"port\" : 5432, \"dialect\": \"postgres\", \"database\": \"$DATABASE\", \"username\": \"$USER\", \"password\": \"$PASSWORD\" }}" > $DB_CONFIG_FILE
echo "{ \"baseUrl\" : \"/\", \"uploadDir\" : \"/tmp/cms-uploads/\" }" > $CMS_CONFIG_FILE
grunt --verbose --force jenkins
rm -f $DB_CONFIG_FILE
rm -f $CMS_CONFIG_FILE
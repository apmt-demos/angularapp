angular.module('taskService', [])
	// super simple service
	// each function returns a promise object 
	.factory('Tasks', ['$http',function($http) {
		return {
			getContainerStream : function() {
				return $http.get('/api/containers');
			},
			getGeospatialEvents : function() {
				return $http.get('/api/events');
			},
			slackMessage : function(botname, icon_url, message){
				var url = 'https://hooks.slack.com/services/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';
				var data = JSON.stringify({
					"username": botname,
					"icon_url": icon_url, 
					"text": message
				});
				console.log(data);
				return $http.post(
					url,
					data,
					{
						headers: {
							'Content-Type': 'text/plain; charset=UTF-8'
						}
					}
				);
			}
		}
	}]);


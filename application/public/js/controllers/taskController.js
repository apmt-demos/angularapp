angular.module('taskController', [])
	// inject the Task service factory into our controller
	.controller('taskController', ['$scope', '$http', 'Tasks', function ($scope, $http, Tasks) {
		$scope.containers = [];
		$scope.containerInfo = null;
		$scope.sendSlackMessage = function(){
			var container = $scope.containers[0];
			Tasks.slackMessage("container-"+container.container_id.toString(), ":containerbot:", "I am now positioned at [" + container.latitude + ", " + container.longitude+"]. Full speed ahead!").then((data) => {console.log("success");});
		}
		$scope.startSim = function(){
			startSimulation();
		}
		function startSimulation(){
			setInterval(loop,1000);
		}
		function loop() {
            console.log("Running...");
			Tasks.getContainerStream().then(function (response) {
				var containerObjects = processResponse(response.data);
				if(containerObjects.length > 0){
					containerObjects.forEach((cont)=>{
						var isInScope = _.findWhere($scope.containers, { container_id: cont.container_id });
						if(_.isUndefined(isInScope)){
							$scope.containers.push(cont);
						}
						else{
							$scope.containers = $scope.containers.filter(e => e.container_id != cont.container_id);
							$scope.containers.push(cont);
						}
					});
				}
				if ($scope.containers.length != 0) {
					drawBubbles($scope.containers);
				}
			})
				.catch((err) => {
					console.log(err);
				});
		}

		function processResponse(list) {
			if(list.length > 0){
				var containers = [];
				list.forEach((container) => containers.push(JSON.parse(container)));			
				var groupedContainers = _.groupBy(containers, function(container){ return container.container_id;});
				var uniqueContainerIds = [];
				Object.keys(groupedContainers).forEach((key) => {
					uniqueContainerIds.push(key);
				});
				var lastContainerData = [];
				uniqueContainerIds.forEach((id)=>{
					var allContainerData = _.where(containers, {container_id: id});
					lastContainerData.push(allContainerData[allContainerData.length-1]);
				});
				var data = [];
				if($scope.containerInfo != null) addEventsToSelectedContainer(lastContainerData);
				lastContainerData.forEach((item) => {
					var obj = item;
					//Add .bubbles parameters to container object<
					obj.radius = 2;
					obj.fillKey = 'cont';
					data.push(obj);
				});
				return data;
			}
			return {};
		}
		dateFormat.masks.ourTimeFormat = "yyyy-mm-dd HH:MM:ss";
		
		//MAP
		var map = new Datamap({ 
			element: document.getElementById('mapContainer'),
			scope: 'world',
			responsive: true,
			setProjection: function(element) {
				var projection = d3.geo.equirectangular()
					.center([0, 0])
					.translate([element.offsetWidth / 2, element.offsetHeight / 2])
					.scale(200);
				var path = d3.geo.path()
					.projection(projection);
				return {path: path, projection: projection};
			},
			fills: {
				defaultFill: "#363636",
				cont: '#5c42f4'
			},
			geographyConfig: {
				popupOnHover: false,
				highlightOnHover: false,
				borderWidth: 1,
				borderOpacity: 1,
				borderColor: "#363636"
			}
		});
		function initContainerInfo(containerId, position, order){
			$scope.containerInfo = {
				containerId: containerId,
				position: position,
				order: order,
				events: []
			};
		}
		$scope.resetContainerInfo = function(){
			resetContainerInfo();
		}
		function resetContainerInfo(){
			document.getElementById("mapContainer").style.width = "100%";
			window.dispatchEvent(new Event('resize'));
			$scope.containerInfo = null;
			resetContainerLogTable();
		};

		function resetContainerLogTable(){
			var new_tbody = document.createElement('tbody');
			var old_tbody = document.getElementById("logTable").getElementsByTagName("tbody")[0];
			old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
		}
		$scope.test = function(){
			console.log("We hit this");
		}
		function addEventsToSelectedContainer(arrayOfEvents) {
			var event = _.findWhere(arrayOfEvents, { container_id: $scope.containerInfo.container_id });
			if(!_.isUndefined(event)){
				var tbody = document.getElementById("logTable").getElementsByTagName("tbody")[0];
				var row = tbody.insertRow(0);
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				cell1.innerHTML = dateFormat(event.time_stamp, "ourTimeFormat")
				cell2.innerHTML = "[" + event.latitude.toFixed(6) +", " + event.longitude.toFixed(6) + "]";
			}
		}

		function drawBubbles(cont) {
			map.bubbles(cont, {
				popupTemplate: function(geo, data) {
					return "<div class='hoverinfo'>Container information: " + 
								"<p>ID: " + data.container_id + "</p>" + 
								"<p>Position: [ " + data.longitude + " , " + data.latitude + " ]</p>" +
								"</div>";
				}
			});

			map.svg.selectAll('.datamaps-bubble').on('click', function(){
				resetContainerInfo();
				var data = JSON.parse(this.getAttribute("data-info"));
				console.log(data);
				data.latitude =  data.latitude.toFixed(6);
				data.longitude =  data.longitude.toFixed(6);
				$scope.containerInfo = data;
				$scope.containerInfo.events = [];
				document.getElementById("mapContainer").style.width = "70%";
				window.dispatchEvent(new Event('resize'));
			});
		}

		/* ADD CLICK EVENTS TO CLOSE CONTAINER INFORMATION  */
		window.addEventListener('resize', function() {
			map.resize();
		});

		/* ################################
		   ##### START THE SIMULATION ##### 
		   ################################
		*/
		console.log(map.svg);

		var zoom = d3.behavior.zoom()
			.scaleExtent([1.32, 1000])
			//.translateExtent([[-1400, 700], [-325, -200]])
			.on("zoom", redraw);

		map.svg.call(zoom);

		function redraw() {
			map.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			console.log("Translate: " + d3.event.translate);
			console.log("Scale: " + d3.event.scale);
		}
		
		startSimulation();
	}]
);

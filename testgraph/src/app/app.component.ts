import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { HttpClient } from '@angular/common/http';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4plugins from "@amcharts/amcharts4/plugins/sunburst";

import {first, debounceTime, distinctUntilChanged, tap, switchMap, catchError, map, filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'testgraph';
  private chart: am4charts.XYChart;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone, private http: HttpClient) {}

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngOnInit(){
  	

	this.http.get<any[]>(`https://corona.lmao.ninja/v2/countries/India, Nepal, Bangladesh, Pakistan, Bhutan, Sri Lanka, Maldives?yesterday=`)
	.pipe(first())
	.subscribe( 
        response => {
        	am4core.useTheme(am4themes_animated);

		  	let chart = am4core.create("chartdiv", am4plugins.Sunburst);
			chart.padding(0,0,0,0);
			chart.radius = am4core.percent(98);

			chart.data = []

        	for(var item of response){
        		var temp = {};
        		var totalamount = item.active + item.deaths + item.recovered;
        		temp['name'] = item.country;
        		temp['children'] = [
        			{
        				name: "Total Cases",
        				value : totalamount
        			},
        			{
        				name: "Recovered",
        				value : item.recovered
        			},
        			{
        				name: "Deaths",
        				value : item.deaths
        			},
        			{
        				name: "Active",
        				value : item.active
        			}
        		];

        		chart.data.push(temp); 
        	}

        	chart.colors.step = 2;
			chart.fontSize = 11;
			chart.innerRadius = am4core.percent(10);

			// define data fields
			chart.dataFields.value = "value";
			chart.dataFields.name = "name";
			chart.dataFields.children = "children";


			let level0SeriesTemplate = new am4plugins.SunburstSeries();
			level0SeriesTemplate.hiddenInLegend = false;
			chart.seriesTemplates.setKey("0", level0SeriesTemplate)

			// this makes labels to be hidden if they don't fit
			level0SeriesTemplate.labels.template.truncate = true;
			level0SeriesTemplate.labels.template.hideOversized = true;

			level0SeriesTemplate.labels.template.adapter.add("rotation", function(rotation, target) {
			  target.maxWidth = target.dataItem.slice.radius - target.dataItem.slice.innerRadius - 10;
			  target.maxHeight = Math.abs(target.dataItem.slice.arc * (target.dataItem.slice.innerRadius + target.dataItem.slice.radius) / 2 * am4core.math.RADIANS);

			  return rotation;
			})


			let level1SeriesTemplate = level0SeriesTemplate.clone();
			chart.seriesTemplates.setKey("1", level1SeriesTemplate)
			level1SeriesTemplate.fillOpacity = 0.75;
			level1SeriesTemplate.hiddenInLegend = true;

			let level2SeriesTemplate = level0SeriesTemplate.clone();
			chart.seriesTemplates.setKey("2", level2SeriesTemplate)
			level2SeriesTemplate.fillOpacity = 0.5;
			level2SeriesTemplate.hiddenInLegend = true;

			chart.legend = new am4charts.Legend();

		  	//this.chart = chart;
        }
    ) 
  }
}

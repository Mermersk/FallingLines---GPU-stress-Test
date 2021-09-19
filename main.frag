#version 300 es
precision mediump float;

layout(location = 0) out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_numPoints;



//Random from book of shaders, section: noise
float randomBOS(in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float random(float seed) {

	return fract(sin(seed )* 4922891.0);
}

float circle(vec2 uv, vec2 pos) {
	
	float d = distance(uv, pos);
	float c = smoothstep(0.005, 0.0052, d);
	
	return 1.0 - c;
	

}

float lineAB2(vec2 a, vec2 b, vec2 uv) {
	
	
    /*Makes the position "a" effectively the new center of coordinate space uv.
    so where "a" was is now vec2(0.0) -> the origin  */
    uv = uv - a;
    /*
    	Creates vector g which is "b" but represented in the new coordinate system.
    	Else "b" would be in the coordinate system before applying "uv - a", which would be wrong
    */
    vec2 g = b - a;
    
    /*
   		To rotate a vector (vector v) 90 degrees counterclockwise (around origin):
   		v = (-v.y, v.x)
   		clockwise: v = (v.y, -v.x)
   	*/
   	//Why is it necessary to rotate UV by 90 degrees??
   	//Seems be only reason is that line goes across where the dot product is close to zero
   	//Those value will be about 90 degrees rotated from where we actually want the line to be.
   	//It aslo sets up nicely to do the little trick of multiplying the dot product with the length from the origin!
    uv = vec2(-uv.y, uv.x);
    
    float dotP = dot(normalize(uv), normalize(g));
    float y = 0.0;
    //if (dotP > -0.02 && dotP < 0.02) {
    	//y = pow(dotP, 1.0);
    //}
    
    //Makes an even line, see notes in notebook for why this is the case.
    dotP = dotP * (length(uv));
    //float angle = 1.0 - acos(dotP);
	
	float startSteppingVal = 0.0001;
	float smoothStepRange = 0.006;
	//Now we have an infinite line passing through each vertex
	float l = 1.0 - smoothstep(startSteppingVal, startSteppingVal + smoothStepRange, abs(dotP));
	
	
	
	//---- Cutting it up so that it doesnt extend beyond the vertices
	
	//rotate uv back (clockwise), because its easier to have the axis in "original" position
	uv = vec2(uv.y, -uv.x);
	
	vec2 middlePointOfLine = g / 2.0;
	float distToMiddleOfLine = length(middlePointOfLine);
	//distance from middle point to all other vectors
	float dfmp = distance(middlePointOfLine, uv);
	//creating a cricle where our determines its diameter
	float circleAroundLine = 1.0 - smoothstep(distToMiddleOfLine, distToMiddleOfLine + 0.01, dfmp);
	
	l *= circleAroundLine;
	
	return l; //abs(dotP) + l +

}

void main() {
	 vec2 uv = gl_FragCoord.xy/u_resolution;
    
    float ar = u_resolution.x / u_resolution.y;
    uv.x *= ar;
    
    vec3 col = vec3(0.0);
    
    //float timer = mod(u_time*0.1, 2.0);
    //Fow webGL dynamic array hack
	const int PointsMAX = 100;
	//Fow webGL dynamic array hack
    vec2 points[PointsMAX];
    
    for (int i = 0; i < PointsMAX; i++) {
		if (i > u_numPoints) {
			break;
		}
    	vec2 pointPos = vec2(randomBOS(vec2(float(i) + 23.0, float(i) + 17.0)) * ar, randomBOS(vec2(float(i) + 11.0, float(i) + 19.0)) + 1.0);
    	float downSpeed = mod(u_time * (randomBOS(vec2(float(i) + 21.0, float(i) + 15.0)))*0.2, 2.0);
    	pointPos.y -= downSpeed;
    	//X-movement
    	if (mod(float(i), 2.0) == 0.0) {
    		//pointPos.x += tan(u_time + randomBOS(vec2(i + 11.0, i + 2.0)))*0.1; 
    		pointPos.x += cos(u_time + randomBOS(vec2(float(i) + 1.0, float(i) + 3.0))*6.28)*0.1; 
    	}
    	points[i] = pointPos;
    	
    	//float line = lineAB2(vec2(0.0), pointPos, uv);
    	//col += line;
    	//col += circle(uv, pointPos)*0.3;
    
    }
    
    for (int i = 0; i < PointsMAX; i++) {
		if (i > u_numPoints) {
			break;
		}
    	vec2 curPoint = points[i];
    	for (int v = i + 1; v < PointsMAX; v++) {
			if (v > u_numPoints) {
			break;
		}
    		vec2 checkPoint = points[v];
    		float d = distance(curPoint, checkPoint);
    		//if (d < 0.15) {
    			float line = lineAB2(curPoint, checkPoint, uv);
    			float opacity = 1.0 - d; // 1.0 if points are on top of each other
    			opacity = smoothstep(0.35, 1.0, opacity);
    			col += (line * opacity) * mix(vec3(0.49, 0.43, 0.99), vec3(0.87, 0.34, 0.2), opacity*1.4);
    		//}
    		
    	}
    }
    
    //col += circle(uv, vec2(0.5, 0.85));
    
    outColor = vec4(col, 1.0);
}
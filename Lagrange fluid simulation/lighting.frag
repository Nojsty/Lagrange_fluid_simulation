#version 430 core

// Blinn-Phong lighting model

void main()
{
	// read unit normal vector
    vec3 unitNormal = texture( normals_texture, in_data.tex_coord ).xyz;
	
	// transform to normal vector
    vec3 normal = vec3( ( unitNormal.x - 0.5 ) * 2, ( unitNormal.y - 0.5 ) * 2, ( unitNormal.z - 0.5 ) * 2 );

    // apply Blinn-Phong
    vec3 viewer_direction = normalize( vec3( 0, 0, 0 ) - to_eye_space( in_data.tex_coord ) );
    vec3 halfwayVec = normalize( light_direction + viewer_direction );
    
    vec3 specular_color = ( vec3( light_color.x * specular_coef.x, light_color.y * specular_coef.y, light_color.z * specular_coef.z  ) ) * pow( dot( normal, halfwayVec ), specular_exponent );
    vec3 diffuse_color = ( vec3( light_color.x * diffuse_coef.x, light_color.y * diffuse_coef.y, light_color.z * diffuse_coef.z  ) ) * max( 0, dot( normal, light_direction ) );

    final_color = ambient_color + vec4( diffuse_color.xyz, 1 ) + vec4( specular_color.xyz, 1 );

    gl_FragDepth = self_orig_z;
}

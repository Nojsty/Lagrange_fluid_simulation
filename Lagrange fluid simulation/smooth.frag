#version 430 core

// apply bilateral smoothing filter for fluid particles
void main()
{
    vec3 P_uv = to_eye_space( in_data.tex_coord );
    vec3 r = vec3( particle_radius, particle_radius, 0 );

    // projected U, L
    vec3 U_proj = to_tex_space( P_uv + r ).xyz;
    vec3 L_proj = to_tex_space( P_uv - r ).xyz;

    // deltas for neighborhood
    int delta_u = int( floor( min( ( U_proj.x - L_proj.x ) / ( 2 * pixel_delta.x ), smoothing_radius ) ) );
    int delta_v = int( floor( min( ( U_proj.y - L_proj.y ) / ( 2 * pixel_delta.y ), smoothing_radius ) ) ); 

    // bilateral filter
    float W = 0;
    float sum_value = 0;
    float z_buf = texture( depth_texture, in_data.tex_coord ).r;

    for ( int p = -delta_u; p <= delta_u; ++p )
    {
        for ( int q = -delta_v; q <= delta_v; ++q )
        {
            // only circular neighborhood 
            if ( length( vec2( p, q ) ) > smoothing_radius )
            {
                continue;
            }

            float z_buf_eps = texture( depth_texture, vec2( in_data.tex_coord.x + pixel_delta.x * p, in_data.tex_coord.y + pixel_delta.y * q ) ).r;

            // exclude background
            if ( z_buf_eps >= 1 )
            {
                continue;
            }

			// range kernel formula
            float kernel_range = ( 1 / ( 2 * 3.14159 * smooting_gauss_sigma * smooting_gauss_sigma ) ) *
                                 pow( 2.71828, -pow( ( abs( z_buf_eps - z_buf ) * smooting_depth_falloff ), 2 ) / ( 2 * smooting_gauss_sigma * smooting_gauss_sigma ) );
								 
			// spatial kernel formula
            float kernel_spatial = ( 1 / ( 2 * 3.14159 * smooting_gauss_sigma * smooting_gauss_sigma ) ) *
                                 pow( 2.71828, -pow( ( length( vec2( p, q ) ) / smoothing_radius ), 2 ) / ( 2 * smooting_gauss_sigma * smooting_gauss_sigma ) );
            
            W += kernel_range * kernel_spatial;
            sum_value += z_buf_eps * kernel_range * kernel_spatial;            
        }   
    }

    // if z'(u,v) is invalid 
    if ( W == 0 )
    {
        gl_FragDepth = self_orig_z;
    }
    else
    {
        gl_FragDepth = ( 1 / W ) * sum_value;
    }

    float show_z = pow(gl_FragDepth, 10);
    final_color = vec4(show_z, show_z, show_z, 1);
}

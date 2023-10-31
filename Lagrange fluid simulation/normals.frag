#version 430 core

// compute fluid surface normals

// computes a derivative of the surface of the fluid in the direction corresponding to the U/V delta
vec3 position_delta(vec3 origin, vec2 delta)
{
    vec3 derivative = vec3( 0, 0, 0 );

    if ( delta.x > 0 && delta.y == 0 )
    {
        // Compute a derivative of the surface of the fluid in direction of U delta
        vec3 origin_pos = to_eye_space( vec2( in_data.tex_coord.x + delta.x, in_data.tex_coord.y ) );
        vec3 origin_neg = to_eye_space( vec2( in_data.tex_coord.x - delta.x, in_data.tex_coord.y ) );
        
        vec3 du_plus = origin_pos - origin;
        vec3 du_minus = origin - origin_neg;

        if ( abs( du_plus.z ) <= abs( du_minus.z ) )
        {
            derivative = du_plus;
        }
        else
        {
            derivative = du_minus;
        }
    }
    else if ( delta.x == 0 && delta.y > 0 )
    {
        // Compute a derivative of the surface of the fluid in direction of V delta
        vec3 origin_pos = to_eye_space( vec2( in_data.tex_coord.x, in_data.tex_coord.y + delta.y ) );
        vec3 origin_neg = to_eye_space( vec2( in_data.tex_coord.x, in_data.tex_coord.y - delta.y ) );

        vec3 dv_plus = origin_pos - origin;
        vec3 dv_minus = origin - origin_neg;

        if ( abs( dv_plus.z ) <= abs( dv_minus.z ) )
        {
            derivative = dv_plus;
        }
        else
        {
            derivative = dv_minus;
        }
    }

    return derivative;
}

void main()
{
    vec3 derivative_u = position_delta( to_eye_space( in_data.tex_coord ), vec2( pixel_delta.x, 0) );
    vec3 derivative_v = position_delta( to_eye_space( in_data.tex_coord ), vec2( 0, pixel_delta.y ) );

    // compute cross product of partial derivatives and normalize it
    vec3 normal_temp = normalize( cross( derivative_u, derivative_v ) );

    // convert to <0,1> to obtain unit normal vector at the rendered texel
    normal_rgb = vec3( ( normal_temp.x + 1 ) / 2, ( normal_temp.y + 1 ) / 2, ( normal_temp.z + 1 ) / 2 );
	
    final_color = vec4(normal_rgb, 1);
}

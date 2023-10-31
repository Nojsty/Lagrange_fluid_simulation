#version 430 core

layout(location = 0) in vec4 position;      
layout(location = 2) in vec2 tex_coords;    
layout(location = 0) out vec4 final_color;  

uniform mat4 projection_matrix; // transform from camera space to NDC
uniform float particle_radius;  

// render particle as a sphere and compute
// z-shift of rendered point on surface of sphere
void main()
{
    float nx = ( tex_coords.x - 0.5 ) * 2;
    float ny = ( tex_coords.y - 0.5 ) * 2;

    // determine if texel lies on the sphere
    float nx2ny2 = pow( nx, 2 ) + pow( ny, 2 );
    if ( nx2ny2 > 1 )
    {
        discard;
        return;
    }
    float nz_sqrd = 1 - nx2ny2;
    float nz = sqrt( nz_sqrd );

    // compute the point on sphere
    vec4 sphere_point_in_camera_space = position;
    sphere_point_in_camera_space.z += particle_radius * nz;

    // project to clip space
    vec4 point_clip = projection_matrix * vec4(sphere_point_in_camera_space.xyz, 1); 

    // compute point's Z coordinate
    vec4 point_ndc = point_clip / point_clip.w;

    // convert .z from <-1, 1> to <0, 1>
    gl_FragDepth = ( point_ndc.z + 1 ) / 2;

    float show_z = max(min(pow(gl_FragDepth, 10),1),0);
    final_color = vec4(show_z, show_z, show_z, 1);
}

file(GLOB_RECURSE LIB_PUBLIC_HEADERS "include/*.h")

add_library(lib INTERFACE
)

target_sources(lib INTERFACE ${LIB_PUBLIC_HEADERS})

target_include_directories(lib
        INTERFACE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_features(lib INTERFACE cxx_std_20)

target_link_libraries(lib
        INTERFACE sfml-graphics sfml-window sfml-system
)
add_library(lib INTERFACE
)

target_include_directories(lib
        INTERFACE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_features(lib INTERFACE cxx_std_20)

target_link_libraries(lib
        INTERFACE sfml-graphics sfml-window sfml-system
)
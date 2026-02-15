add_library(core STATIC
)

target_include_directories(lib
        PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include
        PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(lib
        PUBLIC sfml-graphics sfml-window sfml-system
)
#include "lib/view_manager.h"

int main()
{
	Gallows gallows{"assets/dict.gallows"};
	auto view = view_manager::ViewManager{gallows};
	view.Run();
}

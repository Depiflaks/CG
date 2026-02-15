#include "lib/view_manager.h"

int main()
{
	auto view = view_manager::ViewManager{};
	view.NextView();
	view.NextView();
	view.Run();
}

//
// Created by smmm on 2/15/26.
//

#ifndef CG_VIEW_STRATEGY_H
#define CG_VIEW_STRATEGY_H

namespace view_strategy
{

class ViewStrategy : private GallowsObserver
{
public:
	void OnWordChanged() override;

	virtual void Draw(sf::RenderTarget& target, sf::RenderStates states);
};


} // namespace view_strategy

#endif // CG_VIEW_STRATEGY_H

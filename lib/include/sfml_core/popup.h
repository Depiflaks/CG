//
// Created by smmm on 2/23/26.
//

#ifndef CG_POPUP_H
#define CG_POPUP_H

#include "button.h"
#include "callback.h"
#include "font.h"
#include "sfml_core.h"

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/Text.hpp>

namespace sfml_core
{

class Popup : public Widget
{
public:
	Popup(SimpleCallback closeWindow, SimpleCallback nextGame)
		: Widget({}, {})
		, m_closeButton(std::move(closeWindow))
		, m_nextGameButton(std::move(nextGame))
	{
		Build();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) const
	{
		target.draw(m_backgroundRect, states);
		target.draw(m_titleBlock, states);
		m_closeButton.Draw(target, states);
		m_nextGameButton.Draw(target, states);
	}

	void OnClick(sf::Vector2f position) const
	{
		if (m_closeButton.Contains(position))
		{
			m_closeButton.OnClick();
		}
		if (m_nextGameButton.Contains(position))
		{
			m_nextGameButton.OnClick();
		}
	}

	void Centerize(sf::Vector2f size)
	{
		SetPosition({ (size.x - Bounds().x) / 2, (size.y - Bounds().y) / 2.f });
	}

	const std::string& Caption() const
	{
		return m_caption;
	}

	sf::Color CaptionColor() const
	{
		return m_captionColor;
	}

	void SetCaption(const std::string& caption)
	{
		m_caption = caption;
		m_titleBlock.setString(caption);
	}

	void SetCaptionColor(sf::Color color)
	{
		m_captionColor = color;
		m_titleBlock.setFillColor(color);
	}

	void SetBackgroundColor(sf::Color color)
	{
		m_backgroundRect.setFillColor(color);
	}

	void SetBackgroundOutlineColor(sf::Color color)
	{
		m_backgroundRect.setOutlineColor(color);
	}

	void SetBackgroundOutlineThickness(float thickness)
	{
		m_backgroundRect.setOutlineThickness(thickness);
	}

	void Rebuild()
	{
		Centerize({800, 600});
		std::cout << Position().x << " " << Position().y << std::endl;
		constexpr float gap = 20.f;
		constexpr float bottomMargin = 20.f;
		const sf::Vector2f blockPosition{ Position().x
				+ (Bounds().x - m_nextGameButton.Bounds().x
					  - m_closeButton.Bounds().x - gap)
					/ 2.f,
			Position().y
				+ (Bounds().y - m_nextGameButton.Bounds().y - bottomMargin) };

		std::cout << blockPosition.x << " " << blockPosition.y << std::endl;

		m_closeButton.SetPosition({ blockPosition.x, blockPosition.y });
		m_nextGameButton.SetPosition(
			{ blockPosition.x + gap + m_nextGameButton.Bounds().x,
				blockPosition.y });

		m_closeButton.Rebuild();
		m_nextGameButton.Rebuild();

		m_backgroundRect.setSize(Bounds());

		const sf::FloatRect titleBounds = m_titleBlock.getLocalBounds();
		m_titleBlock.setOrigin(titleBounds.left + titleBounds.width / 2.f,
			titleBounds.top + titleBounds.height / 2.f);

		m_titleBlock.setPosition(
			Position().x + Bounds().x / 2.f, Position().y + 40.f);

		m_backgroundRect.setPosition(Position());
	}

private:
	void Build()
	{
		m_closeButton.SetCharSize(16);
		m_closeButton.SetLabel("Close");
		m_closeButton.SetLabelColor(sf::Color::Red);

		m_nextGameButton.SetCharSize(16);
		m_nextGameButton.SetLabel("Next Game");
		m_nextGameButton.SetLabelColor(sf::Color::Blue);

		m_closeButton.Rebuild();
		m_nextGameButton.Rebuild();

		m_font = loadFont();
		m_titleBlock.setFont(m_font);
		m_titleBlock.setString(m_caption);
		m_titleBlock.setCharacterSize(28);
		m_titleBlock.setFillColor(m_captionColor);

		Rebuild();
	}

	std::string m_caption{ "Label" };
	sf::Color m_captionColor = sf::Color::Black;

	sf::RectangleShape m_backgroundRect{};
	sf::Font m_font{};
	sf::Text m_titleBlock{};

	Button m_closeButton;
	Button m_nextGameButton;
};

} // namespace sfml_core
#endif // CG_POPUP_H
